import { Recipe } from "../../../../types/recipe";
import RecipeImage from "../../../../components/RecipeImage/RecipeImage.tsx";

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

function RecipeModal({ recipe, onClose }: Props) {
  return (
    <div className="recipe-modal" onClick={onClose}>
      <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{recipe.name}</h2>
        <RecipeImage src={recipe.imageUrl} alt={recipe.name} />
        <p><strong>Portionen:</strong> {recipe.portionCount}</p>
        <p><strong>Kalorien:</strong> {recipe.caloriesPerServing} kcal</p>
        <p><strong>Schwierigkeit:</strong> {recipe.difficulty}</p>
        <p><strong>Zubereitung:</strong></p>
        <p>{recipe.instructions}</p>
        <button onClick={onClose}>Schließen</button>
      </div>
    </div>
  );
}

export default RecipeModal;
