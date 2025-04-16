import { useNavigate } from "react-router-dom";
import RecipeCard from "../../../components/RecipeCard/RecipeCard.tsx";
import Button from "../../../components/Button/Button";
import "./RecipeSuggestions.css";
import { useRecipeSuggestions } from "./useRecipeSuggestions.ts";

function RecipeSuggestions() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipeSuggestions(3);

  if (loading) return <div>Lade Rezepte...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="recipe-suggestions">
      <h3>Probier doch mal folgende Rezepte:</h3>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onSelect={() => navigate(`/recipes/${recipe.id}`)}
          />
        ))}
      </div>
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
