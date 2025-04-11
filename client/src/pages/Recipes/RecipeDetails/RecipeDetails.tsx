import { useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import { useRecipeDetails } from "./useRecipeDetails";
import { LikeButton } from "../../../components/LikeButton/LikeButton"; // <--- NEUE Komponente!
import "./RecipeDetails.css";

function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const recipeId = parseInt(id || "0", 10);

  const { recipe, ingredients, loading, error } = useRecipeDetails(recipeId);

  if (loading) return <div>Lade Rezeptdetails...</div>;
  if (error) return <div>{error}</div>;
  if (!recipe) return <p>Rezept nicht gefunden.</p>;

  return (
    <div className="recipe-details-main">
      <div className="recipe-title-container">
        <h1 className="recipe-title">{recipe.name}</h1>
        <LikeButton recipeId={recipeId} />
      </div>

      <div className="recipe-layout">
        <div className="recipe-image-wrapper">
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            imageClassName="recipe-img"
            preview
          />
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
              src={ingredient.imageUrl || "platzhalter.png"}
              alt={ingredient.name}
              className="ingredient-img"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecipeDetails;
