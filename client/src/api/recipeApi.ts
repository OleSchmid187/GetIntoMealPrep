import axios from "axios";
import { Recipe } from "../types/recipe";

export async function fetchAllRecipes(): Promise<Recipe[]> {
  const res = await fetch("/api/recipe");
  console.log(res);
  if (!res.ok) throw new Error("Fehler beim Laden der Rezepte");
  return res.json();
}

export const fetchRecipeById = async (id: number): Promise<Recipe> => {
  const response = await axios.get<Recipe>(`/api/recipe/${id}`);
  return response.data;
};

export async function fetchPaginatedRecipes(
  first: number,
  limit: number
): Promise<{ data: Recipe[]; total: number }> {
  const response = await axios.get<{ data: Recipe[]; total: number }>(
    `/api/recipe?start=${first}&limit=${limit}`
  );
  return response.data;
}

export async function fetchRandomRecipes(count: number): Promise<Recipe[]> {
  const response = await axios.get<Recipe[]>(`/api/recipe/random?count=${count}`);
  return response.data;
}