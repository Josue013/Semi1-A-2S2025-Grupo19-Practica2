const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const fetch = require("node-fetch");

class AuthController {
  // LOGIN
  static async login(req, res) {
    try {
      console.log("🔐 Login attempt");
      const { correo_electronico, password } = req.body;

      console.log("📥 Login data:", {
        correo_electronico,
        hasPassword: !!password,
      });

      // Validaciones básicas
      if (!correo_electronico || !password) {
        return res.status(400).json({
          success: false,
          message: "Correo electrónico y contraseña son requeridos",
        });
      }

      // Buscar usuario por email
      const user = await User.findByEmail(correo_electronico.trim());

      if (!user) {
        console.log("❌ Usuario no encontrado:", correo_electronico);
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Verificar contraseña
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        console.log("❌ Contraseña incorrecta para:", correo_electronico);
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Obtener estadísticas del usuario
      const recetasCreadas = await User.getRecipeCount(user.id);
      const recetasFavoritas = await User.getFavoriteCount(user.id);

      // Login exitoso
      console.log("✅ Login exitoso para:", user.nombre_usuario);
      return res.status(200).json({
        success: true,
        message: "Login exitoso",
        user: {
          id: user.id,
          nombre_usuario: user.nombre_usuario,
          correo_electronico: user.correo_electronico,
          nombre_completo: user.nombre_completo,
          imagen_perfil: user.imagen_perfil,
          recetas_creadas: recetasCreadas,
          recetas_favoritas: recetasFavoritas,
        },
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // REGISTRO
  static async register(req, res) {
    try {
      console.log("📝 Register attempt");
      const {
        nombre_usuario,
        correo_electronico,
        nombre_completo,
        password,
        confirmPassword,
        imagen_perfil, // base64 image
      } = req.body;

      console.log("📥 Register data:", {
        nombre_usuario,
        correo_electronico,
        nombre_completo,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword,
        hasImage: !!imagen_perfil,
      });

      // VALIDACIONES BÁSICAS
      if (
        !nombre_usuario ||
        !correo_electronico ||
        !nombre_completo ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son requeridos",
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo_electronico.trim())) {
        return res.status(400).json({
          success: false,
          message: "Formato de correo electrónico inválido",
        });
      }

      // Validar contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Las contraseñas no coinciden",
        });
      }

      // VERIFICAR QUE EL USERNAME NO EXISTA
      const existingUserByUsername = await User.findByUsername(
        nombre_usuario.trim()
      );
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya está en uso",
        });
      }

      // VERIFICAR QUE EL EMAIL NO EXISTA
      const existingUserByEmail = await User.findByEmail(
        correo_electronico.trim()
      );
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está registrado",
        });
      }

      // PASO 1: CREAR USUARIO EN BASE DE DATOS (SIN IMAGEN PRIMERO)
      const hashedPassword = await hashPassword(password);

      const userData = {
        nombre_usuario: nombre_usuario.trim(),
        correo_electronico: correo_electronico.trim(),
        nombre_completo: nombre_completo.trim(),
        password_hash: hashedPassword,
        imagen_perfil: null, // Por ahora null, la actualizaremos después
      };

      const userId = await User.create(userData);
      console.log("✅ User created with ID:", userId);

      // PASO 2: SUBIR IMAGEN A AZURE SI HAY UNA (AHORA QUE SE TIENE EL userId)
      let finalImageUrl = null;
      let imageUploadSuccess = false;

      if (imagen_perfil && imagen_perfil.startsWith("data:image/")) {
        try {
          console.log(`🔄 Uploading profile image for user ${userId}...`);

          // URL de la Azure Function
          const azureFunctionUrl =
            process.env.AZURE_FUNCTION_URL ||
            "https://func-recetas-api.azurewebsites.net/api";

          const uploadResponse = await fetch(
            `${azureFunctionUrl}/upload/profile-image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userId, //  AHORA userId EXISTE
                image: imagen_perfil,
              }),
            }
          );

          const uploadData = await uploadResponse.json();
          console.log("📥 Azure upload response:", uploadData);

          if (uploadData.success) {
            finalImageUrl = uploadData.imageUrl;
            imageUploadSuccess = true;
            console.log("✅ Image uploaded successfully:", finalImageUrl);
          } else {
            console.log("❌ Image upload failed:", uploadData.message);
          }
        } catch (imageError) {
          console.error("❌ Error uploading image to Azure:", imageError);
        }
      }

      // PASO 3: OBTENER USUARIO FINAL (CON IMAGEN ACTUALIZADA SI SE SUBIÓ)
      const newUser = await User.findById(userId);

      return res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: newUser.id,
          nombre_usuario: newUser.nombre_usuario,
          correo_electronico: newUser.correo_electronico,
          nombre_completo: newUser.nombre_completo,
          imagen_perfil: newUser.imagen_perfil, // URL de Azure o null
          recetas_creadas: 0,
          recetas_favoritas: 0,
        },
        imageUploaded: imageUploadSuccess,
        imageUrl: finalImageUrl,
      });
    } catch (error) {
      console.error("❌ Register error:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        details: error.message,
      });
    }
  }
}

module.exports = AuthController;