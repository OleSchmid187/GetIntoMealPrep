import { useEffect, useState } from "react";
import { fetchRandomRecipes } from "../../../api/recipeApi";
import { Recipe } from "../../../types/recipe";
import RecipeCard from "./RecipeCard/RecipeCard";
import "./RecipeSuggestions.css";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";

function RecipeSuggestions() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomRecipes(6)
      .then((fetchedRecipes) => setRecipes(fetchedRecipes))
      .catch((err) => console.error("Fehler beim Laden der Rezepte:", err));
  }, []);

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

      <Button size="large" color="secondary" onClick={() => navigate("/recipes")}>
        Mehr Rezepte entdecken
      </Button>

    </div>
  );
}

export default RecipeSuggestions;
