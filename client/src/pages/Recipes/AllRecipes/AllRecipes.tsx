import { useState } from "react";
import { Paginator } from "primereact/paginator";
import RecipeCard from "../../../components/RecipeCard/RecipeCard";
import "./AllRecipes.css";
import { useAllRecipes } from "./useAllRecipes";
import { useNavigate } from "react-router-dom";

function AllRecipes() {
  const [first, setFirst] = useState(0);
  const recipesPerPage = 18;
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
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={() => navigate(`/recipes/${recipe.id}`)}
            />
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
