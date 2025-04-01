import { Recipe } from "../../../../types/recipe";
import { getImageUrl } from "../../../../utils/getImageUrl";

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

function RecipeModal({ recipe, onClose }: Props) {
  return (
    <div className="recipe-modal" onClick={onClose}>
      <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{recipe.name}</h2>
        <img
          src={getImageUrl(recipe.imageUrl)}
          alt={recipe.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/fallback.png";
          }}
        />
        <p><strong>Portionen:</strong> {recipe.portionCount}</p>
        <p><strong>Kalorien:</strong> {recipe.calories} kcal</p>
        <p><strong>Schwierigkeit:</strong> {recipe.difficulty}</p>
        <p><strong>Zubereitung:</strong></p>
        <p>{recipe.instructions}</p>
        <button onClick={onClose}>Schließen</button>
      </div>
    </div>
  );
}

export default RecipeModal;
