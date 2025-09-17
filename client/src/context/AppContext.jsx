import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "Q";

  const isDevelopment = import.meta.env.DEV;

  const API_URL_DIRECT = isDevelopment
    ? "/api/direct"
    : "https://func-recetas-api.azurewebsites.net/api";

  const API_URL_GATEWAY = isDevelopment
    ? "/api/gateway"
    : "https://apim-recetas-g19.azure-api.net/func-recetas-api";

  // URL PARA EXPRESS API (LOGIN/REGISTER)
  const API_URL_AUTH = isDevelopment
    ? "http://172.185.26.94/"
    : "http://172.185.26.94/";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log("✅ Usuario cargado desde localStorage:", userData.id);
      } catch (error) {
        console.log("❌ Error cargando usuario desde localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching recipes...");

      const response = await fetch(`${API_URL_DIRECT}/recipes`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.recipes) {
        setRecipes(data.recipes);
        console.log(`✅ ${data.recipes.length} recetas cargadas`);
      } else {
        console.log("❌ Error en response de recetas:", data);
        setRecipes([]);
      }
    } catch (error) {
      console.error("❌ Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeById = async (recipeId) => {
    try {
      const response = await fetch(`${API_URL_GATEWAY}/recipes/${recipeId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.recipe : null;
    } catch (error) {
      console.error(`❌ Error fetching recipe ${recipeId}:`, error);
      return null;
    }
  };

  // CREAR RECETA CON USERID REAL
  const createRecipe = async (recipeData) => {
    try {
      console.log("🔄 Creating recipe...");

      if (!user) {
        toast.error("Debes iniciar sesión para crear recetas");
        return { success: false, message: "No user logged in" };
      }

      // AGREGAR USERID REAL
      const dataWithUser = {
        ...recipeData,
        userId: user.id, // ID real del usuario logueado
      };

      console.log("📤 Enviando receta con userId:", user.id);

      const requestConfig = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataWithUser),
      };

      const response = await fetch(`${API_URL_GATEWAY}/recipes`, requestConfig);
      const data = await response.json();

      console.log("📥 Respuesta de createRecipe:", data);

      if (data.success) {
        toast.success("¡Receta creada exitosamente!");
        await fetchRecipes();
        return { success: true, recipeId: data.recipeId };
      } else {
        toast.error(data.message || "Error al crear la receta");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Error creating recipe:", error);
      toast.error("Error de conexión");
      return { success: false, message: "Network error" };
    }
  };

  // SUBIR IMAGEN CON USERID REAL
  const uploadProfileImage = async (imageFile) => {
    try {
      if (!user) {
        toast.error("Debes iniciar sesión para subir imágenes");
        return { success: false, message: "No user logged in" };
      }

      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch(`${API_URL_GATEWAY}/upload/profile-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // ID real del usuario logueado
          image: base64Image,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("¡Imagen subida exitosamente!");

        if (data.user) {
          const updatedUser = {
            ...user,
            profileImage: data.user.imagen_perfil,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        return { success: true, imageUrl: data.imageUrl };
      } else {
        toast.error(data.message || "Error al subir la imagen");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      toast.error("Error de conexión");
      return { success: false, message: "Network error" };
    }
  };

  const fetchRecipesByCategory = async (category) => {
    try {
      const filteredRecipes = recipes.filter((recipe) =>
        recipe.category.toLowerCase().includes(category.toLowerCase())
      );
      return filteredRecipes;
    } catch (error) {
      console.error("Error fetching category recipes:", error);
      return [];
    }
  };

  // LOGIN REAL CON EXPRESS API - CORREGIDO PARA EMAIL
  const loginUser = async (credentials) => {
    try {
      console.log("🔄 Intentando login...");
      console.log("📤 Enviando credenciales:", {
        email: credentials.email,
        hasPassword: !!credentials.password,
      });

      const response = await fetch(`${API_URL_AUTH}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo_electronico: credentials.email,
          password: credentials.password,
        }),
      });

      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        const userData = {
          id: data.user.id,
          name: data.user.nombre_usuario,
          fullName: data.user.nombre_completo,
          email: data.user.correo_electronico,
          profileImage: data.user.imagen_perfil,
          recetasCreadas: data.user.recetas_creadas,
          recetasFavoritas: data.user.recetas_favoritas,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Usuario logueado exitosamente:", userData.id);
        toast.success(`¡Bienvenido ${userData.name}!`);
        return { success: true, user: userData };
      } else {
        console.log("❌ Login fallido:", data.message);
        toast.error(data.message || "Error en las credenciales");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Error de conexión con el servidor");
      return { success: false, message: "Error de conexión" };
    }
  };

  // REGISTRO CON MANEJO DE IMAGEN
  const registerUser = async (userData) => {
    try {
      console.log("🔄 Intentando registro...");

      const response = await fetch(`${API_URL_AUTH}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_usuario: userData.username,
          correo_electronico: userData.email,
          nombre_completo: userData.name,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          imagen_perfil: userData.profileImage, // base64 o null
        }),
      });

      const data = await response.json();
      console.log("📥 Register response:", data);

      if (data.success) {
        const newUser = {
          id: data.user.id,
          name: data.user.nombre_usuario,
          fullName: data.user.nombre_completo,
          email: data.user.correo_electronico,
          profileImage: data.user.imagen_perfil, // URL de Azure o null
          recetasCreadas: 0,
          recetasFavoritas: 0,
        };

        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        console.log("✅ Usuario registrado exitosamente:", newUser.id);

        // Mensaje especial si se subió imagen
        if (data.imageUploaded) {
          toast.success("¡Cuenta creada exitosamente con foto de perfil!");
        } else {
          toast.success("¡Cuenta creada exitosamente!");
        }

        return { success: true, user: newUser };
      } else {
        console.log("❌ Registro fallido:", data.message);
        toast.error(data.message || "Error al crear la cuenta");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("❌ Register error:", error);
      toast.error("Error de conexión");
      return { success: false, message: "Error de conexión" };
    }
  };

  const fetchUserProfile = async () => {
    // Ya no se necesita
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    setFavoriteRecipes({});
    toast.success("¡Hasta luego!");
    navigate("/");
  };

  const addToFavorites = (recipeId) => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar favoritos");
      return;
    }

    let favData = structuredClone(favoriteRecipes);
    favData[recipeId] = true;
    setFavoriteRecipes(favData);
    toast.success("Receta guardada en favoritos");
  };

  const removeFromFavorites = (recipeId) => {
    let favData = structuredClone(favoriteRecipes);
    delete favData[recipeId];
    setFavoriteRecipes(favData);
    toast.success("Receta removida de favoritos");
  };

  const getFavoritesCount = () => {
    return Object.keys(favoriteRecipes).length;
  };

  const value = {
    navigate,
    user,
    setUser,
    showUserLogin,
    setShowUserLogin,
    recipes,
    setRecipes,
    loading,
    favoriteRecipes,
    setFavoriteRecipes,
    searchQuery,
    setSearchQuery,

    // FUNCIONES CON USUARIOS REALES
    fetchRecipes,
    fetchRecipeById,
    fetchRecipesByCategory,
    createRecipe,
    uploadProfileImage,
    loginUser,
    registerUser,
    logoutUser,
    fetchUserProfile,
    addToFavorites,
    removeFromFavorites,
    getFavoritesCount,
    API_URL_DIRECT,
    API_URL_GATEWAY,
    API_URL_AUTH,
    isDevelopment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
