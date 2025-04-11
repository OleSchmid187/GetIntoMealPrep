// useRecipeLikeStatus.ts
import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import axios from "axios";

export function useRecipeLikeStatus(recipeId: number) {
  const { getIdToken } = useLogto();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = await getIdToken();
        const res = await axios.get(`/api/recipe/${recipeId}/is-liked`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLiked(res.data === true);
      } catch (err) {
        console.error("Fehler beim Abrufen des Like-Status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [recipeId, getIdToken]);

  const toggleLike = async () => {
    if (updating) return;

    setUpdating(true);
    try {
      const token = await getIdToken();
      const url = isLiked
        ? `/api/recipe/${recipeId}/unlike`
        : `/api/recipe/${recipeId}/like`;

      await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Fehler beim Umschalten des Like-Status", err);
    } finally {
      setUpdating(false);
    }
  };

  return {
    isLiked,
    loading,
    updating,
    toggleLike,
  };
}
