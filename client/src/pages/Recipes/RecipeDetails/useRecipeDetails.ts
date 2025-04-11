import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../../types/recipe";

export function useRecipeDetails(recipeId: number) {
  const { getIdToken } = useLogto();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<
    { id: number; name: string; quantity: number; unit: string; imageUrl?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        
        const [recipeRes, ingredientsRes] = await Promise.all([
          axios.get(`/api/recipe/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/recipe/${recipeId}/ingredients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRecipe({ ...recipeRes.data, ingredients: ingredientsRes.data });
        setIngredients(ingredientsRes.data);
      } catch (err) {
        console.error("Fehler beim Laden des Rezepts oder der Zutaten", err);
        setError("Fehler beim Laden des Rezepts oder der Zutaten");
      } finally {
        setLoading(false);
      }
    };

    if (recipeId > 0) {
      load();
    } else {
      setLoading(false);
      setError("Ungültige Rezept-ID");
    }
  }, [recipeId, getIdToken]);

  return { recipe, ingredients, loading, error };
}
