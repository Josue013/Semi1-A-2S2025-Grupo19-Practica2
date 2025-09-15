import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams, Link } from "react-router-dom";
import { Heart, Clock, Users, ChefHat, Star, ArrowLeft } from "lucide-react";
import RecipeCard from "../components/RecipeCard";

const RecipeDetails = () => {
  const {
    recipes,
    navigate,
    addToFavorites,
    removeFromFavorites,
    favoriteRecipes,
    fetchRecipeById,
  } = useAppContext();
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);

      // Primero buscar en las recetas ya cargadas
      const existingRecipe = recipes.find(
        (item) => item._id === id || item.id === id
      );

      if (existingRecipe) {
        console.log("✅ Recipe found in existing recipes:", existingRecipe);
        setRecipe(existingRecipe);
      } else {
        // Si no está en las recetas cargadas, obtener desde API
        console.log("🔄 Fetching recipe from API...");
        const fetchedRecipe = await fetchRecipeById(id);

        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
        } else {
          console.log("❌ Recipe not found");
          setRecipe(null);
        }
      }

      setLoading(false);
    };

    if (id) {
      loadRecipe();
    }
  }, [id, recipes, fetchRecipeById]);

  useEffect(() => {
    if (recipes.length > 0 && recipe) {
      let recipesCopy = recipes.filter(
        (item) =>
          recipe.category === item.category &&
          item._id !== recipe._id &&
          item.id !== recipe.id
      );
      setRelatedRecipes(recipesCopy.slice(0, 5));
    }
  }, [recipes, recipe]);

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

  const handleFavoriteClick = () => {
    const recipeIdToUse = recipe._id || recipe.id;
    if (favoriteRecipes[recipeIdToUse]) {
      removeFromFavorites(recipeIdToUse);
    } else {
      addToFavorites(recipeIdToUse);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="lg:w-1/2">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mt-16 text-center">
        <p className="text-xl text-gray-500 mb-4">Receta no encontrada</p>
        <button
          onClick={() => navigate("/recipes")}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
        >
          Ver todas las recetas
        </button>
      </div>
    );
  }

  // Usar el ID correcto para favoritos
  const recipeIdForFavorites = recipe._id || recipe.id;

  return (
    <div className="mt-12">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">
          Inicio
        </Link>{" "}
        /
        <Link to="/recipes" className="hover:text-orange-500">
          {" "}
          Recetas
        </Link>{" "}
        /
        <Link
          to={`/recipes/${recipe.category.toLowerCase()}`}
          className="hover:text-orange-500"
        >
          {" "}
          {recipe.category}
        </Link>{" "}
        /<span className="text-orange-500"> {recipe.title}</span>
      </p>

      {/* Botón de regreso */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Imagen principal */}
        <div className="lg:w-1/2">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={
                recipe.image && recipe.image[0]
                  ? recipe.image[0]
                  : recipe.imageUrl ||
                    "https://practica2imagenes.blob.core.windows.net/practica2imagenes/default-recipe.jpg"
              }
              alt={recipe.title}
              className="w-full h-96 object-cover"
            />
            <button
              onClick={handleFavoriteClick}
              className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full transition-colors shadow-md"
            >
              <Heart
                className={`w-6 h-6 ${
                  favoriteRecipes[recipeIdForFavorites]
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </button>
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                recipe.difficulty
              )}`}
            >
              {recipe.difficulty}
            </div>
          </div>
        </div>

        {/* Información de la receta */}
        <div className="lg:w-1/2">
          <div className="mb-4">
            <span className="text-sm text-orange-500 font-medium uppercase tracking-wide">
              {recipe.category}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            {recipe.title}
          </h1>

          {/* Rating simulado */}
          <div className="flex items-center gap-1 mb-6">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            <span className="text-gray-600 ml-2">(4.0) · 127 valoraciones</span>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {recipe.description}
          </p>

          {/* Información rápida */}
          <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-orange-50 rounded-lg">
            <div className="text-center">
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tiempo</p>
              <p className="font-semibold">{recipe.prepTime} min</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Porciones</p>
              <p className="font-semibold">{recipe.servings || 4}</p>
            </div>
            <div className="text-center">
              <ChefHat className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chef</p>
              <p className="font-semibold text-sm">{recipe.author}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleFavoriteClick}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition font-medium ${
                favoriteRecipes[recipeIdForFavorites]
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteRecipes[recipeIdForFavorites] ? "fill-red-600" : ""
                }`}
              />
              {favoriteRecipes[recipeIdForFavorites]
                ? "En Favoritos"
                : "Guardar"}
            </button>
            <button className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium">
              Empezar a Cocinar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs para ingredientes e instrucciones */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "ingredients"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Ingredientes
            </button>
            <button
              onClick={() => setActiveTab("instructions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "instructions"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Instrucciones
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "ingredients" && (
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Ingredientes Necesarios
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">
                    No hay ingredientes disponibles
                  </li>
                )}
              </ul>
            </div>
          )}

          {activeTab === "instructions" && (
            <div className="max-w-4xl">
              <h3 className="text-xl font-semibold mb-4">Pasos a Seguir</h3>
              <ol className="space-y-6">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="pt-1">
                        <p className="text-gray-700 leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">
                    No hay instrucciones disponibles
                  </li>
                )}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Recetas relacionadas */}
      {relatedRecipes.length > 0 && (
        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max mb-8">
            <p className="text-3xl font-medium">Recetas Similares</p>
            <div className="w-20 h-0.5 bg-orange-500 rounded-full mt-2"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
            {relatedRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
          <button
            onClick={() => {
              navigate("/recipes");
              scrollTo(0, 0);
            }}
            className="mx-auto cursor-pointer px-12 my-16 py-3 border-2 border-orange-500 rounded-lg text-orange-500 hover:bg-orange-500 hover:text-white transition font-medium"
          >
            Ver más recetas
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
