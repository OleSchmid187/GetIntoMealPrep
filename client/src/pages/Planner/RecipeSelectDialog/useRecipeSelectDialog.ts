import { useEffect, useMemo, useState } from 'react';
import { useLogto } from '@logto/react';
import axios from 'axios';
import { Recipe } from '../../../types/recipe'; // Passe den Pfad ggf. an

export function useRecipeSelectDialog(visible: boolean) {
  const { getIdToken } = useLogto();

  const [token, setToken] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token holen
  useEffect(() => {
    getIdToken()
      .then((t) => {
        if (!t) throw new Error('Token undefined');
        setToken(t);
      })
      .catch((err) => {
        console.error('Token-Fehler:', err);
        setError('Authentifizierung fehlgeschlagen');
        setLoading(false);
      });
  }, [getIdToken]);

  // Rezepte laden wenn Dialog geöffnet
  useEffect(() => {
    if (!token || !visible) return;

    const fetchSortedRecipes = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/recipe/sorted-by-name', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
      } catch (err) {
        console.error('Fehler beim Laden der Rezepte:', err);
        setError('Fehler beim Laden der Rezepte');
      } finally {
        setLoading(false);
      }
    };

    fetchSortedRecipes();
  }, [token, visible]);

  // Gefilterte Liste je nach Suchfeld
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  return {
    recipes: filteredRecipes,
    search,
    setSearch,
    loading,
    error,
  };
}
