import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../../types/recipe";

export function useRecipeDetails(recipeId: number) {
  const { getIdToken } = useLogto();

  const [token, setToken] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<
    { id: number; name: string; quantity: number; unit: string; imageUrl?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Token laden
  useEffect(() => {
    getIdToken()
      .then((token) => {
        if (token !== undefined) {
          setToken(token);
        } else {
          throw new Error("Token is undefined");
        }
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Tokens", err);
        setError("Authentifizierung fehlgeschlagen");
        setLoading(false);
      });
  }, [getIdToken]);

  // 2. Rezeptdaten laden, sobald Token da ist
  useEffect(() => {
    if (!token || recipeId <= 0) return;

    const load = async () => {
      try {
        const [recipeRes, ingredientsRes] = await Promise.all([
          axios.get(`/api/recipe/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/recipe/${recipeId}/ingredients`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setRecipe({ ...recipeRes.data, ingredients: ingredientsRes.data });
        setIngredients(ingredientsRes.data);
      } catch (err) {
        console.error("Fehler beim Laden der Daten", err);
        setError("Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, recipeId]);

  return { recipe, ingredients, loading, error };
}
