import { useState } from 'react';
import './Planner.css';
import {
  MdFreeBreakfast,
  MdLocalDining,
  MdDinnerDining,
  MdFastfood,
} from 'react-icons/md';
import WeekSwitcher from './WeekSwitcher/WeekSwitcher';
import { useMealPlan, MealPlanEntry } from './useMealPlan';
import { mealType } from '../../types/mealType';
import PlannerCell from './PlannerCell/PlannerCell';
import RecipeSelectDialog from './RecipeSelectDialog/RecipeSelectDialog';

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

function groupEntries(entries: MealPlanEntry[]): {
  [key: string]: MealPlanEntry[];
} {
  const grouped: { [key: string]: MealPlanEntry[] } = {};

  const indexToKey = [
    'sonntag', 'montag', 'dienstag', 'mittwoch',
    'donnerstag', 'freitag', 'samstag'
  ];

  for (const entry of entries) {
    const date = new Date(entry.date);
    const dayKey = indexToKey[date.getDay()];
    const key = `${entry.mealType.toLowerCase()}-${dayKey}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  return grouped;
}

function Planner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMealTime, setSelectedMealTime] = useState<mealType | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
  } = useMealPlan(weekOffset);

  const plan: { [key: string]: MealPlanEntry[] } = groupEntries(entries);

  const handleAddMeal = (mealTime: string, dayKey: string) => {
    setSelectedMealTime(mealTime as mealType);
    setSelectedDayKey(dayKey);
    setDialogVisible(true);
  };

  const handleRecipeSelect = (recipe: { id: number }) => {
    if (!selectedMealTime || !selectedDayKey) return;
  
    const weekdayIndex = daysOfWeek.findIndex((d) => d.key === selectedDayKey);
    const baseMonday = new Date();
    baseMonday.setDate(
      baseMonday.getDate() - ((baseMonday.getDay() + 6) % 7) + weekOffset * 7
    );
    const date = new Date(baseMonday);
    date.setDate(baseMonday.getDate() + weekdayIndex);
  
    addEntry({
      recipeId: recipe.id,
      mealType: selectedMealTime,
      position: plan[`${selectedMealTime}-${selectedDayKey}`]?.length || 0,
      date: date.toISOString().split('T')[0],
    }).then((newEntry) => {
      if (newEntry) {
        setLastAddedId(newEntry.id);
        setTimeout(() => setLastAddedId(null), 1200);
      }
    });
  
    setDialogVisible(false);
    setSelectedMealTime(null);
    setSelectedDayKey(null);
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
                  {daysOfWeek.map((day) => (
                    <PlannerCell
                      key={`${meal.key}-${day.key}`}
                      mealType={meal.key as mealType}
                      day={day.key}
                      weekOffset={weekOffset}
                      meals={plan[`${meal.key}-${day.key}`] || []}
                      onAdd={handleAddMeal}
                      onMove={(id, mealType, date, position) =>
                        updateEntry(id, { mealType, date, position })
                      }
                      onDelete={deleteEntry}
                      lastAddedId={lastAddedId}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        <RecipeSelectDialog
          visible={dialogVisible}
          onHide={() => setDialogVisible(false)}
          onSelect={handleRecipeSelect}
/>
    </div>
  );
}

export default Planner;
