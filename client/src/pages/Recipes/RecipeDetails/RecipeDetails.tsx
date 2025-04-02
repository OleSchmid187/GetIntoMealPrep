import { useParams, useNavigate } from "react-router-dom";
import { fetchRecipeById, fetchRecipeIngredients } from "../../../api/recipeApi";
import { Recipe } from "../../../types/recipe";
import Header from "../../../components/Header/Header";
import { Dialog } from "@mui/material";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import Button from "../../../components/Button/Button";
import "./RecipeDetails.css";
import { useEffect, useState } from "react";

function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [ingredients, setIngredients] = useState<
    { id: number; name: string; quantity: number; unit: string }[]
  >([]);

  useEffect(() => {
    if (id) {
      fetchRecipeById(parseInt(id, 10)).then(setRecipe).catch(console.error);
      fetchRecipeIngredients(parseInt(id, 10)).then(setIngredients).catch(console.error);
    }
  }, [id]);

  if (!recipe) return <p>Rezept nicht gefunden.</p>;

  const handleImageClick = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <>
      <Header />
      <div className="recipe-details-main">
        <Button size="medium" color="secondary" onClick={() => navigate(-1)}>
          Zurück
        </Button>

        <h1 className="recipe-title">{recipe.name}</h1>

        <div className="recipe-layout">
          <div className="recipe-image-wrapper" onClick={handleImageClick}>
            <Image src={recipe.imageUrl} alt={recipe.name} imageClassName="recipe-img" preview />
          </div>

          <div className="recipe-info-section">
            <p><strong>Portionen:</strong> {recipe.portionCount}</p>
            <p><strong>Kalorien:</strong> {recipe.caloriesPerServing} kcal</p>
            <p><strong>Schwierigkeit:</strong> {recipe.difficulty}</p>

            <Divider />

            <h2>Zubereitung</h2>
            <p className="instructions">{recipe.instructions}</p>

            <Divider />

            <h2>Zutaten</h2>
            <div className="ingredients-grid">
              {ingredients.map((ingredient) => (
                <Card
                  key={ingredient.id}
                  title={ingredient.name}
                  className="ingredient-card"
                  subTitle={`${ingredient.quantity} ${ingredient.unit}`}
                >
                  <img
                    src="platzhalter.png" // 🔴 Platzhalter-Bild
                    alt="Zutat Platzhalter"
                    className="ingredient-img"
                  />
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onClose={handleDialogClose}>
          <img src={recipe.imageUrl} alt={recipe.name} className="recipe-dialog-img" />
        </Dialog>
      </div>
    </>
  );
}

export default RecipeDetails;
