import React, { useState, useEffect } from "react";
import { ChefHat, Camera, Edit3, Plus, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import EditProfile from "../components/EditProfile";

const Profile = () => {
  const { user, navigate, logoutUser, uploadProfileImage } = useAppContext();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalFavorites: 0,
    recipesViews: 0,
  });

  const API_URL_DIRECT = import.meta.env.DEV
    ? "/api/direct"
    : "https://func-recetas-api.azurewebsites.net/api";

  // Cargar recetas del usuario
  const fetchUserRecipes = async () => {
    if (!user) {
      setLoadingRecipes(false);
      return;
    }

    try {
      console.log(`🔄 Cargando recetas del usuario ${user.id}...`);

      // Filtrar recetas del usuario desde el estado global
      const myRecipes = await fetch(`${API_URL_DIRECT}/recipes`);
      const data = await myRecipes.json();

      if (data.success) {
        const userOwnRecipes = data.recipes.filter(
          (recipe) =>
            recipe.authorUsername === user.name || recipe.userId === user.id
        );

        setUserRecipes(userOwnRecipes.slice(0, 4)); // Solo las primeras 4 para el perfil

        setStats({
          totalRecipes: userOwnRecipes.length,
          totalFavorites: user.recetasFavoritas || 0,
          recipesViews: userOwnRecipes.reduce(
            (total, recipe) => total + (recipe.views || 0),
            0
          ),
        });

        console.log(`✅ ${userOwnRecipes.length} recetas del usuario cargadas`);
      }
    } catch (error) {
      console.error("❌ Error cargando recetas del usuario:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  useEffect(() => {
    fetchUserRecipes();
  }, [user]);

  const logout = () => {
    logoutUser();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-4">
            Inicia sesión para ver tu perfil
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16 max-w-6xl mx-auto">
      {/* Header del perfil */}
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">Mi Perfil</p>
        <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center relative group">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {user.fullName || user.name}
            </h2>
            <p className="text-gray-600 mb-1">@{user.name}</p>
            <p className="text-gray-500 text-sm mb-4">{user.email}</p>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalRecipes}
                </p>
                <p className="text-sm text-gray-600">Recetas</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalFavorites}
                </p>
                <p className="text-sm text-gray-600">Favoritos</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.recipesViews}
                </p>
                <p className="text-sm text-gray-600">Vistas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            <Edit3 className="w-4 h-4" />
            Editar Perfil
          </button>
          <button
            onClick={() => navigate("/create-recipe")}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Receta
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mis Recetas Recientes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            Mis Recetas Recientes
          </h3>
          {userRecipes.length > 0 && (
            <button
              onClick={() => navigate("/my-recipes")}
              className="text-orange-500 hover:text-orange-600 transition text-sm font-medium"
            >
              Ver todas ({stats.totalRecipes}) →
            </button>
          )}
        </div>

        {loadingRecipes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-48 rounded-lg"
              ></div>
            ))}
          </div>
        ) : userRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe._id}`)}
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={recipe.image[0]}
                    alt={recipe.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-800 truncate">
                    {recipe.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {recipe.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{recipe.category}</span>
                    <span>{recipe.prepTime} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No has creado recetas aún</p>
            <button
              onClick={() => navigate("/create-recipe")}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Crear Mi Primera Receta
            </button>
          </div>
        )}
      </div>

      {/* Modal para editar perfil */}
      {showEditProfile && (
        <EditProfile onClose={() => setShowEditProfile(false)} user={user} />
      )}
    </div>
  );
};

export default Profile;
