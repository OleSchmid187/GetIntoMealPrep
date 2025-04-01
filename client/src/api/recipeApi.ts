import { Recipe } from "../types/recipe";

export async function fetchAllRecipes(): Promise<Recipe[]> {
  const res = await fetch("/api/recipe");
  if (!res.ok) throw new Error("Fehler beim Laden der Rezepte");
  return res.json();
}