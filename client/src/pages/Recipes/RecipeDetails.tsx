import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllRecipes } from "../../api/recipeApi";
import { Recipe } from "../../types/recipe";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header"; // Import Header

function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchAllRecipes()
      .then((recipes) => {
        const foundRecipe = recipes.find((r) => r.id === parseInt(id || "", 10));
        setRecipe(foundRecipe || null);
      })
      .catch((err) => console.error("Fehler beim Laden des Rezepts:", err));
  }, [id]);

  if (!recipe) {
    return <p>Rezept nicht gefunden.</p>;
  }

  return (
    <>
      <Header /> {/* Add Header */}
      <div className="recipe-details">
        <Button size="medium" color="secondary" onClick={() => navigate(-1)}>
          Zurück
        </Button>
        <h1>{recipe.name}</h1>
        <img src={recipe.imageUrl} alt={recipe.name} />
        <p><strong>Portionen:</strong> {recipe.portionCount}</p>
        <p><strong>Kalorien:</strong> {recipe.caloriesPerServing} kcal</p>
        <p><strong>Schwierigkeit:</strong> {recipe.difficulty}</p>
        <p><strong>Zubereitung:</strong></p>
        <p>{recipe.instructions}</p>
      </div>
    </>
  );
}

export default RecipeDetails;
