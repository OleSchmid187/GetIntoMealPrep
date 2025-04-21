import { useState } from "react";
import { Paginator } from "primereact/paginator";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import "./MyRecipes.css";
import { useLikedRecipes } from "./useLikedRecipes";
import { useNavigate } from "react-router-dom";
import { Recipe } from "../../types/recipe";
import RecipeGrid from "../../components/RecipeGrid/RecipeGrid";

function MyRecipes() {
  const [first, setFirst] = useState(0);
  const recipesPerPage = 18;
  const { recipes, loading, error, total } = useLikedRecipes(first, recipesPerPage) as {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
    total: number;
  };
  const navigate = useNavigate();

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  return (
    <div className="my-recipes-page">
      <h1 className="my-recipes-header">Dein Rezeptbuch</h1>
      {loading && <p>Rezepte werden geladen...</p>}
      {error && <p>Fehler beim Laden der Rezepte: {error}</p>}
      {recipes.length === 0 && !loading && !error ? (
        <p className="no-recipes-message">Noch keine Rezepte im Rezeptbuch.</p>
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
  );
}

export default MyRecipes;
