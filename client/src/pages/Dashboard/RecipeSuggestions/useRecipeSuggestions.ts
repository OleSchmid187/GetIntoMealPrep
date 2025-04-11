import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../../types/recipe";

export function useRecipeSuggestions(count: number) {
  const { getIdToken } = useLogto();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        const res = await axios.get(`/api/recipe/random?count=${count}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecipes(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Rezepte", err);
        setError("Fehler beim Laden der Rezepte");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [count, getIdToken]);

  return { recipes, loading, error };
}
