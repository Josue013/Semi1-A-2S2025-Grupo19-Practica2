import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

const RecipeCategory = () => {
  const { fetchRecipesByCategory } = useAppContext();
  const { category } = useParams();
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Info de categorías
  const categoriesInfo = {
    desayunos: {
      text: "Desayunos",
      bgColor: "#FEF3E2",
      description:
        "Comienza tu día con energía con nuestras deliciosas recetas de desayuno",
    },
    almuerzos: {
      text: "Almuerzos",
      bgColor: "#FFF4E6",
      description: "Platos nutritivos y sabrosos para el mediodía",
    },
    cenas: {
      text: "Cenas",
      bgColor: "#F3E8FF",
      description: "Termina tu día con estas exquisitas opciones para la cena",
    },
    postres: {
      text: "Postres",
      bgColor: "#FCE7F3",
      description: "Endulza tu vida con nuestros irresistibles postres",
    },
    bebidas: {
      text: "Bebidas",
      bgColor: "#DBEAFE",
      description: "Refréscate con estas deliciosas bebidas",
    },
  };

  // Función para cargar recetas por categoría
  const loadCategoryRecipes = async () => {
    if (!category) return;

    setLoading(true);
    console.log(`🔄 Cargando recetas de categoría: ${category}`);

    try {
      const recipes = await fetchRecipesByCategory(category);
      setCategoryRecipes(recipes);
      setCategoryInfo(categoriesInfo[category.toLowerCase()]);
      console.log(`✅ ${recipes.length} recetas cargadas para ${category}`);
    } catch (error) {
      console.error("Error loading category recipes:", error);
      setCategoryRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect que se ejecuta cuando cambia la categoría
  useEffect(() => {
    loadCategoryRecipes();
  }, [category]);

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="mt-16">
        <div className="flex flex-col items-end w-max mb-8">
          <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-16 h-0.5 bg-gray-200 animate-pulse rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-80 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      {categoryInfo && (
        <div className="mb-8">
          <div className="flex flex-col items-end w-max mb-4">
            <p className="text-2xl font-medium uppercase">
              {categoryInfo.text}
            </p>
            <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
          </div>
          <p className="text-gray-600 max-w-2xl">{categoryInfo.description}</p>
        </div>
      )}

      {categoryRecipes.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              {categoryRecipes.length} receta
              {categoryRecipes.length !== 1 ? "s" : ""} encontrada
              {categoryRecipes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categoryRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-orange-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-medium text-gray-500 mb-4">
              No hay recetas en esta categoría aún
            </p>
            <p className="text-gray-400 mb-6">
              {category
                ? `Categoría: ${categoryInfo?.text || category}`
                : "Categoría no especificada"}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCategory;
