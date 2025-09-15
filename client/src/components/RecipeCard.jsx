import React from "react";
import { Heart, Clock, Users, ChefHat } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const RecipeCard = ({ recipe }) => {
  const { addToFavorites, removeFromFavorites, favoriteRecipes, navigate } =
    useAppContext();

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

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (favoriteRecipes[recipe._id]) {
      removeFromFavorites(recipe._id);
    } else {
      addToFavorites(recipe._id);
    }
  };

  return (
    recipe && (
      <div
        onClick={() => {
          navigate(`/recipe/${recipe._id}`);
          scrollTo(0, 0);
        }}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group min-w-64 max-w-64 w-full"
      >
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={recipe.image[0]}
            alt={recipe.title}
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                favoriteRecipes[recipe._id]
                  ? "text-red-500 fill-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
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

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
              <span className="text-sm text-gray-600 truncate">
                {recipe.author}
              </span>
            </div>
            <span className="text-xs text-gray-500">Ver receta →</span>
          </div>
        </div>
      </div>
    )
  );
};

export default RecipeCard;
