import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLogto } from '@logto/react';
import { mealType } from '../../types/mealType';

export interface MealPlanEntry {
  id: number;
  recipeId: number;
  date: string;
  mealType: mealType;
  position: number;
  recipe?: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

export function useMealPlan(weekOffset: number) {
  const { getIdToken } = useLogto();
  const [token, setToken] = useState<string | null>(null);
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token laden
  useEffect(() => {
    getIdToken()
      .then((token) => {
        if (token !== undefined) {
          setToken(token);
        } else {
          throw new Error('Token is undefined');
        }
      })
      .catch((err) => {
        console.error('Token-Fehler:', err);
        setError('Authentifizierung fehlgeschlagen');
        setLoading(false);
      });
  }, [getIdToken]);

  // Daten laden
  useEffect(() => {
    if (!token) return;
    fetchEntries();
  }, [token, weekOffset]);

  // 🔁 Entries nachladen
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/mealplan', {
        params: { weekOffset },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error('Fehler beim Laden des Mealplans', err);
      setError('Fehler beim Laden des Mealplans');
    } finally {
      setLoading(false);
    }
  };

  // Gericht hinzufügen → danach neu laden
  const addEntry = async (entry: Omit<MealPlanEntry, 'id'>) => {
    if (!token) return;

    await axios.post('/api/mealplan', entry, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchEntries(); // ⬅️ aktualisiert den State mit vollständigen Rezepten
  };

  // Gericht verschieben
  const updateEntry = async (id: number, updated: Partial<MealPlanEntry>) => {
    if (!token) return;

    const res = await axios.put(`/api/mealplan/${id}`, { ...updated, id }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...res.data } : e))
    );
  };

  // Gericht löschen
  const deleteEntry = async (id: number) => {
    if (!token) return;

    await axios.delete(`/api/mealplan/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
