import { useState } from "react";
import { Paginator } from "primereact/paginator";
import RecipeCard from "../../Dashboard/RecipeSuggestions/RecipeCard/RecipeCard";
import "./AllRecipes.css";
import { useAllRecipes } from "./useAllRecipes";

function AllRecipes() {
  const [first, setFirst] = useState(0);
  const recipesPerPage = 18;
  const { recipes, loading, error, total } = useAllRecipes(first, recipesPerPage);

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  return (
    <>
      <div className="all-recipes">
        <h2>Alle Rezepte</h2>
        {loading && <p>Rezepte werden geladen...</p>}
        {error && <p>Fehler beim Laden der Rezepte: {error}</p>}
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => {}} />
          ))}
        </div>
        <Paginator
          first={first}
          rows={recipesPerPage}
          totalRecords={total}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}

export default AllRecipes;
