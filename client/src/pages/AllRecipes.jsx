import React, { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import RecipeCard from "../components/RecipeCard";

const AllRecipes = () => {
  const { recipes, searchQuery, setSearchQuery } = useAppContext();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    maxTime: "",
  });

  useEffect(() => {
    let filtered = [...recipes];

    // Filtro por búsqueda
    if (searchQuery.length > 0) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          recipe.author.toLowerCase().includes(searchQuery.toLowerCase())
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

    if (filters.maxTime) {
      filtered = filtered.filter(
        (recipe) => recipe.prepTime <= parseInt(filters.maxTime)
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      category: "",
      difficulty: "",
      maxTime: "",
    });
    setSearchQuery("");
  };

  const hasActiveFilters =
    searchQuery || filters.category || filters.difficulty || filters.maxTime;

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">Todas las Recetas</p>
        <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-8 space-y-4">
        {/* Búsqueda */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recetas por nombre, descripción o autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition ${
              showFilters
                ? "border-orange-500 text-orange-600"
                : "border-gray-300"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las categorías</option>
                  <option value="desayunos">Desayunos</option>
                  <option value="almuerzos">Almuerzos</option>
                  <option value="cenas">Cenas</option>
                  <option value="postres">Postres</option>
                  <option value="bebidas">Bebidas</option>
                </select>
              </div>

              {/* Filtro por dificultad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las dificultades</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              {/* Filtro por tiempo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo máximo (minutos)
                </label>
                <select
                  value={filters.maxTime}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxTime: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sin límite</option>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredRecipes.length} receta
            {filteredRecipes.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " encontradas" : " disponibles"}
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Buscando: "<span className="font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>
      </div>

      {/* Grid de recetas */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-50 rounded-lg">
          <Search className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-500 mb-2">
            No se encontraron recetas
          </p>
          <p className="text-gray-400 text-center mb-4">
            {searchQuery
              ? `No hay recetas que coincidan con "${searchQuery}"`
              : "Intenta ajustar los filtros de búsqueda"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AllRecipes;
