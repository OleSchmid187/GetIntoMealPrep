import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRecipeById, fetchRecipeIngredients } from "../../../api/recipeApi";
import { Recipe } from "../../../types/recipe";
import Header from "../../../components/Header/Header";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import "./RecipeDetails.css";

function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
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

  return (
    <>
      <Header />
      <div className="recipe-details-main">

        <h1 className="recipe-title">{recipe.name}</h1>

        <div className="recipe-layout">
          <div className="recipe-image-wrapper">
            <Image src={recipe.imageUrl} alt={recipe.name} imageClassName="recipe-img" preview />
          </div>

          <div className="recipe-info-section">
            <div className="info-row">
              <div><strong>Portionen:</strong> {recipe.portionCount}</div>
              <div><strong>Kalorien:</strong> {recipe.caloriesPerServing} kcal</div>
              <div className={`difficulty-${recipe.difficulty.toLowerCase()}`}>
                <strong>Schwierigkeit:</strong>&nbsp;{recipe.difficulty}
              </div>
            </div>
            <Divider />
            <h2>Zubereitung</h2>
            <p className="instructions">{recipe.instructions}</p>
          </div>
        </div>

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
    </>
  );
}

export default RecipeDetails;
