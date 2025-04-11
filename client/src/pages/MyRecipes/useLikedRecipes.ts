import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../types/recipe";

export function useLikedRecipes(first: number, recipesPerPage: number): {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  total: number;
} {
  const { getIdToken } = useLogto();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        const response = await axios.get(
          `/api/recipe/favorites?start=${first}&limit=${recipesPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecipes(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        console.error("Error loading liked recipes", err);
        setError("Fehler beim Laden der Rezepte.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [first, recipesPerPage, getIdToken]);

  return { recipes, loading, error, total };
}
