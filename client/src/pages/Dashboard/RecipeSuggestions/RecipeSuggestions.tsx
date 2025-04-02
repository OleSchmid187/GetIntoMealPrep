import { useEffect, useState } from "react";
import { fetchAllRecipes } from "../../../api/recipeApi";
import { Recipe } from "../../../types/recipe";
import RecipeCard from "./RecipeCard/RecipeCard";
import RecipeModal from "./RecipeModal/RecipeModal";
import "./RecipeSuggestions.css";
import Button from "../../../components/Button/Button";

function RecipeSuggestions() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchAllRecipes()
      .then(setRecipes)
      .catch((err) => console.error("Fehler beim Laden der Rezepte:", err));
  }, []);

  return (
    <div className="recipe-suggestions">
      <h3>Probier doch mal folgende Rezepte:</h3>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => setSelectedRecipe(recipe)} />
        ))}
      </div>

      <Button size="large" color="secondary" onClick={() => console.log("Mehr Rezepte entdecken")}>
        Mehr Rezepte entdecken
      </Button>

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}

export default RecipeSuggestions;
