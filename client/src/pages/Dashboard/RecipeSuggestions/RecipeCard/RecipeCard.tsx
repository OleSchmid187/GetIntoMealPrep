import { Recipe } from "../../../../types/recipe";
import { getImageUrl } from "../../../../utils/getImageUrl";

interface Props {
  recipe: Recipe;
  onSelect: () => void;
}

function RecipeCard({ recipe, onSelect }: Props) {
  return (
    <div className="recipe-card" onClick={onSelect}>
      <img
        src={getImageUrl(recipe.imageUrl)}
        alt={recipe.name}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/fallback.png";
        }}
      />
      <p>{recipe.name}</p>
    </div>
  );
}

export default RecipeCard;