import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import "./RecipeSuggestions.css";
import { useRecipeSuggestions } from "./useRecipeSuggestions.ts";
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid.tsx";

function RecipeSuggestions() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipeSuggestions(3);

  if (loading) return <div>Lade Rezepte...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="recipe-suggestions">
      <h3>Probier doch mal folgende Rezepte:</h3>
      <RecipeGrid
        recipes={recipes}
        onSelect={(recipe) => navigate(`/recipes/${recipe.id}`)}
        columns={3}
      />
      <Button
        size="large"
        color="secondary"
        onClick={() => navigate("/recipes")}
      >
        Mehr Rezepte entdecken
      </Button>
    </div>
  );
}

export default RecipeSuggestions;
