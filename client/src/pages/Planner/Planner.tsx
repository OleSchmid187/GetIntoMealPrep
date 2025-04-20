import { useState } from 'react';
import './Planner.css';
import {
  MdFreeBreakfast,
  MdLocalDining,
  MdDinnerDining,
  MdFastfood,
  MdAdd,
} from 'react-icons/md';
import { useDrag, useDrop } from 'react-dnd';
import WeekSwitcher from './WeekSwitcher/WeekSwitcher';
import { useMealPlan, MealPlanEntry } from './useMealPlan'; // <– Typ importiert
import RecipeImage from '../../components/RecipeImage/RecipeImage';

const daysOfWeek = [
  { key: 'montag', label: 'Montag' },
  { key: 'dienstag', label: 'Dienstag' },
  { key: 'mittwoch', label: 'Mittwoch' },
  { key: 'donnerstag', label: 'Donnerstag' },
  { key: 'freitag', label: 'Freitag' },
  { key: 'samstag', label: 'Samstag' },
  { key: 'sonntag', label: 'Sonntag' },
];

const mealTimes = [
  { key: 'breakfast', label: 'Frühstück', icon: <MdFreeBreakfast /> },
  { key: 'snack1', label: 'Snack 1', icon: <MdFastfood /> },
  { key: 'lunch', label: 'Mittagessen', icon: <MdLocalDining /> },
  { key: 'snack2', label: 'Snack 2', icon: <MdFastfood /> },
  { key: 'dinner', label: 'Abendessen', icon: <MdDinnerDining /> },
];

const PlaceholderMeal = ({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string;
}) => {
  return (
    <div className="meal-item">
      <div className="recipe-card-image">
        {imageUrl ? <RecipeImage src={imageUrl} alt={name} /> : 'Kein Bild'}
      </div>
      <div className="meal-name">{name}</div>
    </div>
  );
};

function groupEntries(entries: MealPlanEntry[]): {
  [key: string]: MealPlanEntry[];
} {
  const grouped: { [key: string]: MealPlanEntry[] } = {};

  for (const entry of entries) {
    const date = new Date(entry.date);
    const dayKey = date
      .toLocaleDateString('de-DE', { weekday: 'long' })
      .toLowerCase();
    const key = `${entry.mealType.toLowerCase()}-${dayKey}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  return grouped;
}

function Planner() {
  const [weekOffset, setWeekOffset] = useState(0);

  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
  } = useMealPlan(weekOffset);

  const plan: { [key: string]: MealPlanEntry[] } = groupEntries(entries);

  const handleAddMeal = (mealTime: string, dayKey: string) => {
    alert(`Dialog öffnen für ${mealTime} - ${dayKey}`);

    const fakeRecipeId = 1;
    const weekdayIndex = daysOfWeek.findIndex((d) => d.key === dayKey);
    const baseMonday = new Date();
    baseMonday.setDate(
      baseMonday.getDate() - ((baseMonday.getDay() + 6) % 7) + weekOffset * 7
    );
    const date = new Date(baseMonday);
    date.setDate(baseMonday.getDate() + weekdayIndex);

    addEntry({
      recipeId: fakeRecipeId,
      mealType: mealTime,
      position: plan[`${mealTime}-${dayKey}`]?.length || 0,
      date: date.toISOString().split('T')[0],
    });
  };

  const renderCell = (mealTime: string, day: string) => {
    const key = `${mealTime}-${day}`;
    const meals = plan[key] || [];

    return (
      <td
        key={key}
        className="planner-cell"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          // Drag & Drop später
        }}
      >
        {meals.map((entry, index) => (
          <PlaceholderMeal
            key={entry.id}
            name={entry.recipe?.name || `Gericht ${index + 1}`}
            imageUrl={entry.recipe?.imageUrl}
          />
        ))}
        <div className="add-button-wrapper">
          <button className="add-button" onClick={() => handleAddMeal(mealTime, day)}>
            <MdAdd />
          </button>
        </div>
      </td>
    );
  };

  return (
    <div className="planner-page">
      <div className="dashboard-panel">
        <h3>Wochenplan</h3>
        <WeekSwitcher weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="planner-table">
            <thead>
              <tr>
                <th></th>
                {daysOfWeek.map((day) => (
                  <th key={day.key}>
                    <div className="meal-header">
                      <span>{day.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTimes.map((meal) => (
                <tr key={meal.key}>
                  <td className="day-label">
                    <div className="meal-header">
                      {meal.icon}
                      <span>{meal.label}</span>
                    </div>
                  </td>
                  {daysOfWeek.map((day) => renderCell(meal.key, day.key))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Planner;
