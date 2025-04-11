import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../../types/recipe";

export function useAllRecipes(start: number, limit: number) {
  const { getIdToken } = useLogto();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getIdToken();
        const res = await axios.get(`/api/recipe?start=${start}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecipes(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error loading recipes", err);
        setError("Error loading recipes");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [start, limit, getIdToken]);

  return { recipes, loading, error, total };
}
