import { useState } from "react";
import { Paginator } from "primereact/paginator";
import "./AllRecipes.css";
import { useAllRecipes } from "./useAllRecipes";
import { useNavigate } from "react-router-dom";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid";

function AllRecipes() {
  const [first, setFirst] = useState(0);
  const recipesPerPage = 8;
  const { recipes, loading, error, total } = useAllRecipes(first, recipesPerPage);
  const navigate = useNavigate();

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  return (
    <>
      <div className="all-recipes">
        <h2>Alle Rezepte</h2>
        {loading && <p>Rezepte werden geladen...</p>}
        {error && <p>Fehler beim Laden der Rezepte: {error}</p>}
        {recipes.length === 0 && !loading && !error ? (
          <p className="no-recipes-message">Noch keine Rezepte verfügbar.</p>
        ) : (
          <RecipeGrid
            recipes={recipes}
            onSelect={(recipe) => navigate(`/recipes/${recipe.id}`)}
            columns={4}
          />
        )}
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
