import { Recipe } from "../../types/recipe.ts";
import RecipeImage from "../RecipeImage/RecipeImage.tsx";
import { LikeButton } from "../LikeButton/LikeButton.tsx"; // Import LikeButton
import "./RecipeCard.css"; // Import CSS file

interface Props {
  recipe: Recipe;
  onSelect: () => void;
}

function RecipeCard({ recipe, onSelect }: Props) {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".like-button")) return; // Prevent onSelect if LikeButton is clicked
    onSelect();
  };

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      <div className="recipe-card-image">
        <RecipeImage src={recipe.imageUrl} alt={recipe.name} />
      </div>
      <div className="recipe-card-content">
        <p>{recipe.name}</p>
        <LikeButton recipeId={recipe.id} />
      </div>
    </div>
  );
}

export default RecipeCard;
