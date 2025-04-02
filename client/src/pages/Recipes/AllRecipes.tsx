import { useState } from "react";
import { Paginator } from "primereact/paginator";
import { useFetchRecipes } from "../../hooks/useFetchRecipes";
import RecipeCard from "../Dashboard/RecipeSuggestions/RecipeCard/RecipeCard";
import Header from "../../components/Header/Header";
import "./AllRecipes.css";

function AllRecipes() {
  const { recipes, loading, error } = useFetchRecipes();
  const [first, setFirst] = useState(0);
  const recipesPerPage = 18;

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  const displayedRecipes = recipes.slice(first, first + recipesPerPage);

  return (
    <>
      <Header />
      <div className="all-recipes">
        <h2>Alle Rezepte</h2>
        {loading && <p>Rezepte werden geladen...</p>}
        {error && <p>Fehler beim Laden der Rezepte: {error.message}</p>}
        <div className="recipe-grid">
          {displayedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => {}} />
          ))}
        </div>
        <Paginator
          first={first}
          rows={recipesPerPage}
          totalRecords={recipes.length}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}

export default AllRecipes;
