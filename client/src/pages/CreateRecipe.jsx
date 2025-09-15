import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Plus, X, Clock, Users, ChefHat, Camera } from "lucide-react";
import toast from "react-hot-toast";

const CreateRecipe = () => {
  const { user, createRecipe, navigate } = useAppContext();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Desayunos",
    prepTime: "",
    servings: "4",
    difficulty: "Fácil",
    ingredients: [""],
    instructions: [""],
    images: [],
  });

  const [loading, setLoading] = useState(false);

  const categories = ["Desayunos", "Almuerzos", "Cenas", "Postres", "Bebidas"];
  const difficulties = ["Fácil", "Intermedio", "Difícil"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        ingredients: newIngredients,
      }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData((prev) => ({
      ...prev,
      instructions: newInstructions,
    }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        instructions: newInstructions,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, e.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para crear recetas");
      return;
    }

    // Validaciones
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("La descripción es requerida");
      return;
    }

    if (!formData.prepTime || formData.prepTime <= 0) {
      toast.error("El tiempo de preparación debe ser mayor a 0");
      return;
    }

    const validIngredients = formData.ingredients.filter((ing) => ing.trim());
    if (validIngredients.length === 0) {
      toast.error("Agrega al menos un ingrediente");
      return;
    }

    const validInstructions = formData.instructions.filter((inst) =>
      inst.trim()
    );
    if (validInstructions.length === 0) {
      toast.error("Agrega al menos una instrucción");
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        prepTime: parseInt(formData.prepTime),
        servings: parseInt(formData.servings) || 4,
        difficulty: formData.difficulty,
        ingredients: validIngredients,
        instructions: validInstructions,
        images: formData.images,
      };

      const result = await createRecipe(recipeData);

      if (result.success) {
        toast.success("¡Receta creada exitosamente!");
        navigate("/my-recipes");
      }
    } catch (error) {
      toast.error("Error inesperado al crear la receta");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-16 text-center">
        <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-500 mb-4">
          Inicia sesión para crear recetas
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
    <div className="mt-16 pb-16 max-w-4xl mx-auto">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">Crear Nueva Receta</p>
        <div className="w-16 h-0.5 bg-orange-500 rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Receta *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ej: Pasta con salsa boloñesa casera"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe tu receta..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Tiempo de preparación (minutos) *
              </label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="30"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Porciones
              </label>
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="4"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            <Camera className="w-5 h-5 inline mr-2" />
            Imágenes
          </h3>

          <div className="mb-4">
            <label className="cursor-pointer inline-block px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition">
              <Camera className="w-5 h-5 inline mr-2" />
              Subir Imágenes
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG, GIF (máx 10MB cada una)
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingredientes */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Ingredientes *</h3>

          <div className="space-y-3">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Ingrediente ${index + 1}...`}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Agregar Ingrediente
          </button>
        </div>

        {/* Instrucciones */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Instrucciones *</h3>

          <div className="space-y-3">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mt-2">
                  {index + 1}
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) =>
                    handleInstructionChange(index, e.target.value)
                  }
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Paso ${index + 1}...`}
                  rows={2}
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition self-start mt-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addInstruction}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Agregar Paso
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando Receta..." : "Crear Receta"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/recipes")}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;
