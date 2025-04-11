import { useState } from "react";
import { Paginator } from "primereact/paginator";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import "./MyRecipes.css";
import { useLikedRecipes } from "./useLikedRecipes";
import { useNavigate } from "react-router-dom";
import { Recipe } from "../../types/recipe";

function MyRecipes() {
  const [first, setFirst] = useState(0);
  const recipesPerPage = 18;
  const { recipes, loading, error, total } = useLikedRecipes(first, recipesPerPage) as {
    recipes: Recipe[]; // Explicitly type the recipes array
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
      <h1 className="fancy-header">Dein Rezeptbuch</h1>
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
  );
}

export default MyRecipes;
