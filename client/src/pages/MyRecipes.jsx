import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Heart,
  Clock,
  Users,
  ChefHat,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyRecipes = () => {
  const { user, navigate, recipes, fetchRecipes } = useAppContext();
  const [myRecipes, setMyRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
  });

  const API_URL_DIRECT = import.meta.env.DEV
    ? "/api/direct"
    : "https://func-recetas-api.azurewebsites.net/api";

  // Cargar mis recetas
  const fetchMyRecipes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 Cargando todas las recetas del usuario ${user.id}...`);

      // Obtener todas las recetas y filtrar las del usuario
      const response = await fetch(`${API_URL_DIRECT}/recipes`);
      const data = await response.json();

      if (data.success) {
        const userOwnRecipes = data.recipes.filter(
          (recipe) =>
            recipe.authorUsername === user.name || recipe.userId === user.id
        );

        setMyRecipes(userOwnRecipes);
        setFilteredRecipes(userOwnRecipes);
        console.log(`✅ ${userOwnRecipes.length} recetas del usuario cargadas`);
      }
    } catch (error) {
      console.error("❌ Error cargando mis recetas:", error);
      toast.error("Error cargando tus recetas");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar recetas
  useEffect(() => {
    let filtered = [...myRecipes];

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtros adicionales
    if (filters.category) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty === filters.difficulty
      );
    }

    setFilteredRecipes(filtered);
  }, [myRecipes, searchQuery, filters]);

  useEffect(() => {
    fetchMyRecipes();
  }, [user]);

  const deleteRecipe = async (recipeId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta receta?")) {
      return;
    }

    try {
      // Por ahora solo remover del estado local
      // Más adelante implementaremos el delete en Azure Functions
      setMyRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
      toast.success("Receta eliminada correctamente");
    } catch (error) {
      console.error("Error eliminando receta:", error);
      toast.error("Error al eliminar la receta");
    }
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-xl text-gray-500 mb-4">
          Inicia sesión para ver tus recetas
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

  if (loading) {
    return (
      <div className="mt-16 pb-16">
        <div className="flex flex-col items-end w-max mb-8">
          <p className="text-2xl font-medium uppercase">Mis Recetas</p>
          <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="mt-16 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex flex-col items-start mb-4 md:mb-0">
          <p className="text-2xl font-medium uppercase">Mis Recetas</p>
          <div className="w-16 h-0.5 bg-orange-500 rounded-full mt-1"></div>
        </div>
        <button
          onClick={() => navigate("/create-recipe")}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      {myRecipes.length > 0 && (
        <div className="mb-8 space-y-4">
          {/* Búsqueda */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en mis recetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las categorías</option>
              <option value="desayunos">Desayunos</option>
              <option value="almuerzos">Almuerzos</option>
              <option value="cenas">Cenas</option>
              <option value="postres">Postres</option>
              <option value="bebidas">Bebidas</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las dificultades</option>
              <option value="Fácil">Fácil</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>

          {/* Resultados */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredRecipes.length} de {myRecipes.length} recetas
            </p>
            {(searchQuery || filters.category || filters.difficulty) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ category: "", difficulty: "" });
                }}
                className="text-orange-500 hover:text-orange-600 transition text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid de recetas */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
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
                <div
                  className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    recipe.difficulty
                  )}`}
                >
                  {recipe.difficulty}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-recipe/${recipe._id}`);
                    }}
                    className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                    title="Editar receta"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecipe(recipe._id);
                    }}
                    className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                    title="Eliminar receta"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
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
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{recipe.views || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/recipe/${recipe._id}`)}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition text-sm font-medium"
                >
                  Ver Receta
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : myRecipes.length === 0 ? (
        // No hay recetas
        <div className="flex flex-col items-center justify-center h-[60vh] bg-orange-50 rounded-lg">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl font-medium text-gray-500 mb-4">
              No has creado recetas aún
            </p>
            <p className="text-gray-400 mb-6">
              ¡Comparte tus recetas favoritas con la comunidad!
            </p>
            <button
              onClick={() => navigate("/create-recipe")}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Crear Mi Primera Receta
            </button>
          </div>
        </div>
      ) : (
        // Hay recetas pero no coinciden con los filtros
        <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-50 rounded-lg">
          <Search className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-500 mb-2">
            No se encontraron recetas
          </p>
          <p className="text-gray-400 text-center mb-4">
            No hay recetas que coincidan con los filtros aplicados
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilters({ category: "", difficulty: "" });
            }}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
