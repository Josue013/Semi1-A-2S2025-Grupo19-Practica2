import React from "react";
import RecipeCard from "./RecipeCard";
import { useAppContext } from "../context/AppContext";

const PopularRecipes = () => {
  const { recipes } = useAppContext();

  // Ordenar recetas por tiempo de preparación (las más rápidas primero) y tomar las primeras 5
  const quickestRecipes = recipes
    .filter((recipe) => recipe.title) // Solo recetas válidas
    .sort((a, b) => a.prepTime - b.prepTime)
    .slice(0, 5);

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Recetas Rápidas</p>
      <p className="text-gray-600 mt-2">
        Las recetas más fáciles y rápidas de preparar
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
        {quickestRecipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default PopularRecipes;
