import { MealPlanEntry } from "../pages/Planner/useMealPlan";

export function sortMealPlanEntries(entries: MealPlanEntry[]): MealPlanEntry[] {
  return [...entries].sort((a, b) => a.position - b.position);
}
