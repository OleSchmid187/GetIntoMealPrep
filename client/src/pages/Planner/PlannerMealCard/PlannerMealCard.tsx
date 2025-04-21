import { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { MealPlanEntry } from '../useMealPlan';
import RecipeImage from '../../../components/RecipeImage/RecipeImage';
import './PlannerMealCard.css';

interface PlannerMealCardProps {
  entry: MealPlanEntry;
  name: string;
  imageUrl?: string;
  highlight?: boolean;
}

const PlannerMealCard = ({ entry, name, imageUrl, highlight }: PlannerMealCardProps) => {
  const [, dragRef] = useDrag({
    type: 'MEAL_ENTRY',
    item: { entry },
  });

  const dragElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dragRef) {
      dragRef(dragElementRef.current);
    }
  }, [dragRef]);

  return (
    <div
      ref={dragElementRef}
      className={`planner-meal-card${highlight ? ' highlight' : ''}`}
    >
      <div className="planner-meal-image">
        {imageUrl ? <RecipeImage src={imageUrl} alt={name} /> : 'Kein Bild'}
      </div>
      <div className="planner-meal-name">{name}</div>
    </div>
  );
};

export default PlannerMealCard;
