const { app } = require('@azure/functions');
const { uploadToBlob } = require('../shared/storage');
const { pool } = require('../shared/database');

app.http('uploadProfileImageHandler', {
  methods: ['POST'],
  route: 'upload/profile-image',
  handler: async (request, context) => {
    context.log('🖼️ Upload Profile Image - USER PARAMETER VERSION');

    try {
      // PROCESAR DATOS
      const body = await request.json();
      const { userId, image } = body;

      // VALIDAR USERID
      if (!userId) {
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Se requiere userId para identificar el usuario'
          }
        };
      }

      // VERIFICAR QUE EL USUARIO EXISTE
      const [users] = await pool.execute(
        'SELECT id, nombre_usuario, correo_electronico, nombre_completo FROM usuarios WHERE id = ? AND activo = true',
        [userId]
      );

      if (users.length === 0) {
        return {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Usuario no encontrado'
          }
        };
      }

      const user = users[0];
      context.log(`✅ User identified: ${user.nombre_usuario} (ID: ${user.id})`);

      // VALIDAR IMAGEN
      if (!image || !image.startsWith('data:image/')) {
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Se requiere una imagen válida'
          }
        };
      }

      const base64Data = image.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024;
      if (imageBuffer.length > maxSize) {
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          jsonBody: {
            success: false,
            message: 'Imagen muy grande (máx 5MB)'
          }
        };
      }

      // Subir imagen
      const imageUrl = await uploadToBlob(
        'profiles',
        imageBuffer,
        `profile-${user.id}-${Date.now()}.jpg`
      );

      // Actualizar en base de datos
      await pool.execute(
        'UPDATE usuarios SET imagen_perfil = ? WHERE id = ?',
        [imageUrl, user.id]
      );

      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        jsonBody: {
          success: true,
          message: 'Imagen subida exitosamente',
          imageUrl: imageUrl,
          user: {
            ...user,
            imagen_perfil: imageUrl
          }
        }
      };

    } catch (error) {
      context.log('❌ Error:', error.message);
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        jsonBody: {
          success: false,
          message: 'Error interno del servidor'
        }
      };
    }
  }
});