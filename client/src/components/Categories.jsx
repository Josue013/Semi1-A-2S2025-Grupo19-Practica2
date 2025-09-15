import React, { useEffect, useState } from "react";
import { Coffee, Sun, Sunset, Cookie, Droplets } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Categories = () => {
  const { navigate } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Categorías estáticas - luego será desde Azure Functions
  useEffect(() => {
    setLoading(true);

    const recipeCategories = [
      {
        id: 1,
        nombre: "Desayunos",
        path: "desayunos",
        imagen_url:
          "https://practica2imagenes.blob.core.windows.net/practica2imagenes/hotcakesqueso.jpg",
        icon: <Coffee className="w-8 h-8" />,
        bgColor: "#FEF3E2",
      },
      {
        id: 2,
        nombre: "Almuerzos",
        path: "almuerzos",
        imagen_url:
          "https://practica2imagenes.blob.core.windows.net/practica2imagenes/costillasbbq.jpg",
        icon: <Sun className="w-8 h-8" />,
        bgColor: "#FFF4E6",
      },
      {
        id: 3,
        nombre: "Cenas",
        path: "cenas",
        imagen_url:
          "https://practica2imagenes.blob.core.windows.net/practica2imagenes/lasanadecarne.jpg",
        icon: <Sunset className="w-8 h-8" />,
        bgColor: "#F3E8FF",
      },
      {
        id: 4,
        nombre: "Postres",
        path: "postres",
        imagen_url:
          "https://practica2imagenes.blob.core.windows.net/practica2imagenes/Buñuelosenfreidoradeaire.jpg",
        icon: <Cookie className="w-8 h-8" />,
        bgColor: "#FCE7F3",
      },
      {
        id: 5,
        nombre: "Bebidas",
        path: "bebidas",
        imagen_url:
          "https://practica2imagenes.blob.core.windows.net/practica2imagenes/horchata.jpg",
        icon: <Droplets className="w-8 h-8" />,
        bgColor: "#DBEAFE",
      },
    ];

    setCategories(recipeCategories);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="mt-16">
        <p className="text-2xl md:text-3xl font-medium">Categorías</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-32 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Categorías</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group cursor-pointer py-5 px-3 gap-3 rounded-lg flex flex-col justify-center items-center transition-transform hover:scale-105"
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/recipes/${category.path}`);
              scrollTo(0, 0);
            }}
          >
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition overflow-hidden">
              {category.imagen_url ? (
                <img
                  src={category.imagen_url}
                  alt={category.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-orange-500">{category.icon}</div>
              )}
            </div>
            <p className="text-sm font-medium text-center">{category.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
