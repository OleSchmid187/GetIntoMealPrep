import './RecipeGrid.css';
import RecipeCard from '../RecipeCard/RecipeCard';
import { Recipe } from '../../types/recipe';

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  compact?: boolean;
  columns?: number;
}

const RecipeGrid = ({ recipes, onSelect, compact = false, columns = 4 }: Props) => {
  return (
    <div
      className={`recipe-grid ${compact ? 'compact' : ''} columns-${columns}`}
    >
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          compact={compact}
          onSelect={() => onSelect(recipe)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
