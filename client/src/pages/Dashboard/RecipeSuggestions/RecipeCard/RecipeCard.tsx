import { Recipe } from "../../../../types/recipe";
import RecipeImage from "../../../../components/RecipeImage/RecipeImage.tsx";

interface Props {
  recipe: Recipe;
  onSelect: () => void;
}

function RecipeCard({ recipe, onSelect }: Props) {
  return (
    <div className="recipe-card" onClick={onSelect}>
      <RecipeImage src={recipe.imageUrl} alt={recipe.name} />
      <p>{recipe.name}</p>
    </div>
  );
}

export default RecipeCard;
