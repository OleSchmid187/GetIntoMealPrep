import { useEffect, useState } from "react";
import { fetchAllRecipes } from "../api/recipeApi";
import { Recipe } from "../types/recipe";

export function useFetchRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAllRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { recipes, loading, error };
}
