import { useEffect, useState } from "react";
import { fetchAllRecipes } from "../../../api/recipeApi";
import { Recipe } from "../../../types/recipe";
import "./RecipeSuggestions.css";

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
        {recipes.map((r) => (
          <div
            className="recipe-card"
            key={r.id}
            onClick={() => setSelectedRecipe(r)}
          >
            <img src={r.imageUrl} alt={r.name} />
            <p>{r.name}</p>
          </div>
        ))}
      </div>

      <button className="more-btn">Mehr Rezepte entdecken</button>

      {selectedRecipe && (
        <div className="recipe-modal" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRecipe.name}</h2>
            <img src={selectedRecipe.imageUrl} alt={selectedRecipe.name} />
            <p><strong>Portionen:</strong> {selectedRecipe.portionCount}</p>
            <p><strong>Kalorien:</strong> {selectedRecipe.calories} kcal</p>
            <p><strong>Schwierigkeit:</strong> {selectedRecipe.difficulty}</p>
            <p><strong>Zubereitung:</strong></p>
            <p>{selectedRecipe.instructions}</p>
            <button onClick={() => setSelectedRecipe(null)}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeSuggestions;
