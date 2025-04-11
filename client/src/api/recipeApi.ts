import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../types/recipe";

const getClient = async () => {
  const { getAccessToken } = useLogto();
  const token = await getAccessToken();

  return axios.create({
    baseURL: "/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  const client = await getClient();
  const res = await client.get("/recipe");
  return res.data;
};

export const fetchRecipeById = async (id: number): Promise<Recipe> => {
  const client = await getClient();
  const res = await client.get(`/recipe/${id}`);
  return res.data;
};

export const fetchPaginatedRecipes = async (
  start: number,
  limit: number
): Promise<{ data: Recipe[]; total: number }> => {
  const client = await getClient();
  const res = await client.get(`/recipe?start=${start}&limit=${limit}`);
  return res.data;
};

export const fetchRandomRecipes = async (count: number): Promise<Recipe[]> => {
  const client = await getClient();
  const res = await client.get(`/recipe/random?count=${count}`);
  return res.data;
};

export const fetchRecipeIngredients = async (
  recipeId: number
): Promise<
  {
    id: number;
    name: string;
    quantity: number;
    unit: string;
  }[]
> => {
  const client = await getClient();
  const res = await client.get(`/recipe/${recipeId}/ingredients`);
  return res.data;
};

export const likeRecipe = async (id: number): Promise<void> => {
  const client = await getClient();
  await client.post(`/recipe/${id}/like`);
};

export const unlikeRecipe = async (id: number): Promise<void> => {
  const client = await getClient();
  await client.post(`/recipe/${id}/unlike`);
};

export const fetchFavoriteRecipes = async (): Promise<Recipe[]> => {
  const client = await getClient();
  const res = await client.get(`/recipe/favorites`);
  return res.data;
};
