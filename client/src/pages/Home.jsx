import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import PopularRecipes from "../components/PopularRecipes";

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <PopularRecipes />
    </div>
  );
};

export default Home;
