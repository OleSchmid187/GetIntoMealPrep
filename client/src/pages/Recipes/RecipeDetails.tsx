import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllRecipes } from "../../api/recipeApi";
import { Recipe } from "../../types/recipe";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import "./RecipeDetails.css"; // Import CSS for styling
import { Dialog } from "@mui/material"; // Import Material-UI Dialog

function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

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

  const handleImageClick = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <>
      <Header />
      <div className="recipe-details-container">
        <Button size="medium" color="secondary" onClick={() => navigate(-1)}>
          Zurück
        </Button>
        <h1>{recipe.name}</h1>
        <div className="recipe-details-image-container" onClick={handleImageClick}>
          <img src={recipe.imageUrl} alt={recipe.name} />
        </div>
        <Dialog open={isDialogOpen} onClose={handleDialogClose}>
          <img src={recipe.imageUrl} alt={recipe.name} className="recipe-details-dialog-image" />
        </Dialog>
        <p><strong>Portionen:</strong> {recipe.portionCount}</p>
        <p><strong>Kalorien:</strong> {recipe.caloriesPerServing} kcal</p>
        <p><strong>Schwierigkeit:</strong> {recipe.difficulty}</p>
        <p><strong>Zubereitung:</strong></p>
        <p>{recipe.instructions}</p>
        <h2>Zutaten</h2>
        <div className="recipe-details-ingredients-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="recipe-details-ingredient-card">
              <p>Zutat {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default RecipeDetails;
