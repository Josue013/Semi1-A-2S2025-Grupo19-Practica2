import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllRecipes from "./pages/AllRecipes";
import RecipeCategory from "./pages/RecipeCategory";
import RecipeDetails from "./pages/RecipeDetails";
import Favorites from "./pages/Favorites";
import CreateRecipe from "./pages/CreateRecipe";
import Profile from "./pages/Profile";
import MyRecipes from "./pages/MyRecipes";

const App = () => {
  const { showUserLogin } = useAppContext();

  return (
    <div>
      <Navbar />
      {showUserLogin ? <Login /> : null}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #f97316",
          },
          success: {
            iconTheme: {
              primary: "#f97316",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<AllRecipes />} />
          <Route path="/recipes/:category" element={<RecipeCategory />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
