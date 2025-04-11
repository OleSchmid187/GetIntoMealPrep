import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";
import { Recipe } from "../../../types/recipe";

export function useRecipeSuggestions(count: number) {
  const { getIdToken } = useLogto();

  const [token, setToken] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Token laden, wenn Component mountet
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

  // 2. Rezepte laden, wenn Token vorhanden
  useEffect(() => {
    if (!token) return;

    const fetchRecipes = async () => {
      try {
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

    fetchRecipes();
  }, [token, count]);

  return { recipes, loading, error };
}
