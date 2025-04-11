// LikeButtonWithLogic.tsx
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaSpinner } from "react-icons/fa"; // Import React icons
import { useLogto } from "@logto/react";
import axios from "axios";
import "./LikeButton.css"; // Import custom CSS

interface LikeButtonProps {
  recipeId: number;
}

export function LikeButton({ recipeId }: LikeButtonProps) {
  const { getIdToken } = useLogto();
  const [token, setToken] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        setLoading(false);
      });
  }, [getIdToken]);

  // 2. Like-Status laden (nur wenn Token da ist)
  useEffect(() => {
    if (!token || recipeId <= 0) return;

    const fetchLikeStatus = async () => {
      try {
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

    fetchLikeStatus();
  }, [token, recipeId]);

  const toggleLike = async () => {
    if (!token || updating) return;

    setUpdating(true);

    try {
      const url = isLiked
        ? `/api/recipe/${recipeId}/unlike`
        : `/api/recipe/${recipeId}/like`;

      await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsLiked((prev) => !prev);
    } catch (err) {
      console.error("Fehler beim Umschalten des Like-Status", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <button className="like-button loading" disabled>
        <FaSpinner className="icon spin" /> {/* Spinner icon */}
      </button>
    );
  }

  return (
    <button
      className={`like-button ${isLiked ? "liked" : "not-liked"}`}
      onClick={toggleLike}
      aria-label="Like"
      disabled={updating}
    >
      {isLiked ? <FaHeart className="icon liked-icon" /> : <FaRegHeart className="icon not-liked-icon" />}
    </button>
  );
}
