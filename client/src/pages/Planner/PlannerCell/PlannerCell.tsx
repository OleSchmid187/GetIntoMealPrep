import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { MdAdd } from 'react-icons/md';
import { mealType } from '../../../types/mealType';
import { MealPlanEntry } from '../useMealPlan';
import PlannerMealCard from '../PlannerMealCard/PlannerMealCard';
import './PlannerCell.css';

interface PlannerCellProps {
  mealType: mealType;
  day: string;
  weekOffset: number;
  meals: MealPlanEntry[];
  onAdd: (mealType: string, day: string) => void;
  onMove: (id: number, mealType: mealType, date: string, position: number) => void;
  lastAddedId?: number | null;
}

const PlannerCell = ({ mealType, day, weekOffset, meals, onAdd, onMove, lastAddedId }: PlannerCellProps) => {
  const cellRef = useRef<HTMLTableDataCellElement | null>(null);

  const [, dropRef] = useDrop({
    accept: 'MEAL_ENTRY',
    drop: (item: { entry: MealPlanEntry }) => {
      const dragged = item.entry;

      const weekdayIndex = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag']
        .indexOf(day);
      const baseMonday = new Date();
      baseMonday.setDate(baseMonday.getDate() - ((baseMonday.getDay() + 6) % 7) + weekOffset * 7);
      const targetDate = new Date(baseMonday);
      targetDate.setDate(baseMonday.getDate() + weekdayIndex);

      onMove(dragged.id, mealType, targetDate.toISOString().split('T')[0], meals.length);
    },
  });

  dropRef(cellRef);

  return (
    <td ref={cellRef} className="planner-cell">
      <div className="planner-cell-content">
        {meals.map((entry, index) => (
          <PlannerMealCard
            key={entry.id}
            entry={entry}
            name={entry.recipe?.name || `Gericht ${index + 1}`}
            imageUrl={entry.recipe?.imageUrl}
            highlight={entry.id === lastAddedId}
          />
        ))}
      </div>
      <div className="add-button-wrapper">
        <button className="add-button" onClick={() => onAdd(mealType, day)}>
          <MdAdd />
        </button>
      </div>
    </td>
  );
};

export default PlannerCell;
