import React, { useState, useEffect } from "react";
import { Heart, Clock, Users, ChefHat, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Favorites = () => {
  const {
    recipes,
    favoriteRecipes,
    removeFromFavorites,
    getFavoritesCount,
    navigate,
    user,
  } = useAppContext();

  const [favoritesList, setFavoritesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getFavorites = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para ver tus favoritos");
      return;
    }

    const favList = recipes.filter((recipe) => favoriteRecipes[recipe._id]);
    setFavoritesList(favList);
  };

  const handleRemoveFavorite = (recipeId) => {
    removeFromFavorites(recipeId);
    // Actualizar lista local
    setFavoritesList((prev) =>
      prev.filter((recipe) => recipe._id !== recipeId)
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Fácil":
        return "text-green-600 bg-green-100";
      case "Intermedio":
        return "text-yellow-600 bg-yellow-100";
      case "Difícil":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  useEffect(() => {
    getFavorites();
  }, [recipes, favoriteRecipes, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-500 mb-4">
          Inicia sesión para ver tus recetas favoritas
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">Mis Recetas Favoritas</p>
        <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
      </div>

      {favoritesList.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {getFavoritesCount()} receta{getFavoritesCount() !== 1 ? "s" : ""}{" "}
              guardada{getFavoritesCount() !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => navigate("/recipes")}
              className="text-orange-500 hover:text-orange-600 transition text-sm font-medium"
            >
              Explorar más recetas →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritesList.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image[0]}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(recipe._id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-full transition-colors"
                    title="Quitar de favoritos"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      recipe.difficulty
                    )}`}
                  >
                    {recipe.difficulty}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                      {recipe.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings || 4} porciones</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {recipe.author}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigate(`/recipe/${recipe._id}`);
                        scrollTo(0, 0);
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition"
                    >
                      Ver receta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-lg border border-gray-200">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <div className="text-center">
            <p className="text-2xl font-medium text-gray-500 mb-4">
              No tienes recetas favoritas aún
            </p>
            <p className="text-gray-400 mb-6">
              Explora nuestras deliciosas recetas y guarda tus favoritas
            </p>
            <button
              onClick={() => navigate("/recipes")}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Explorar Recetas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
