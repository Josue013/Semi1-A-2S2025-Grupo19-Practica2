import React from "react";
import { ChefHat, ArrowRight, Search, Heart, Pizza } from "lucide-react";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl overflow-hidden">
      {/* Fondo con patrón más simple */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16">
        {/* Contenido de texto */}
        <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <ChefHat className="w-8 h-8 text-white" />
            <span className="text-white font-medium text-lg">SaborConecta</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Descubre <span className="text-yellow-300">Sabores</span> que
            <br />
            <span className="text-yellow-300">Conectan</span> Corazones
          </h1>

          <p className="text-white/90 text-lg mb-8 max-w-lg">
            Explora recetas caseras, tradicionales y modernas. Desde desayunos
            energéticos hasta postres irresistibles. ¡Tu próxima comida favorita
            te está esperando!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/recipes"
              className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 transition rounded-full text-orange-600 font-semibold shadow-lg"
            >
              Explorar Recetas
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/recipes/desayunos"
              className="group flex items-center gap-2 px-8 py-4 border-2 border-white hover:bg-white/10 transition rounded-full text-white font-semibold"
            >
              Ver Desayunos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Imagen ilustrativa */}
        <div className="flex-1 flex justify-center md:justify-end">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Círculo decorativo */}
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            <div className="absolute inset-4 bg-white/10 rounded-full"></div>

            {/* Contenido central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <ChefHat className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
                <p className="text-2xl font-bold">+100</p>
                <p className="text-sm opacity-90">Recetas Disponibles</p>
              </div>
            </div>

            {/* Elementos flotantes */}
            <div className="absolute top-8 right-8 w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-2xl">
                <Search />
              </span>
            </div>
            <div className="absolute bottom-12 left-4 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xl">
                <Pizza />
              </span>
            </div>
            <div className="absolute top-20 left-12 w-8 h-8 bg-red-300 rounded-full flex items-center justify-center animate-ping">
              <span className="text-sm">
                <Heart />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
