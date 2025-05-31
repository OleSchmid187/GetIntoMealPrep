import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLogto } from '@logto/react';
import { mealType } from '../../types/mealType';
import { sortMealPlanEntries } from '../../utils/sortMealPlanEntries';

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
  const [token, setToken] = useState<string | null | undefined>(undefined); // undefined: initial, null: no token/auth error, string: token
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true); // True initially as we attempt to load token/data
  const [error, setError] = useState<string | null>(null);

  // Token laden
  useEffect(() => {
    let isMounted = true;
    setLoading(true); // Indicate loading process starts or restarts
    setError(null);   // Clear previous errors

    getIdToken()
      .then((fetchedToken) => {
        if (!isMounted) return;

        if (fetchedToken) { // Token is a non-empty string
          setToken(fetchedToken);
          // setLoading(true) is already set. Data loading useEffect will handle further state.
        } else { // Token is null, undefined, or empty string from getIdToken
          setToken(null); // Standardize to null for "no valid token"
          setError("Authentifizierung fehlgeschlagen");
          setEntries([]); // Clear entries as auth failed
          setLoading(false); // No data fetching will occur
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Token-Fehler:', err);
        setToken(null); // Ensure token is null on error
        setError('Authentifizierung fehlgeschlagen');
        setEntries([]); // Clear entries on error
        setLoading(false);
      });
    
    return () => {
      isMounted = false;
    };
  }, [getIdToken]);

  // Daten laden (triggered by token change or weekOffset change)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (token) { // Only if token is a valid string
        setLoading(true); // Explicitly set loading for data fetch
        setError(null);
        try {
          const res = await axios.get('/api/mealplan', {
            params: { weekOffset },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isMounted) {
            setEntries(res.data);
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            console.error('Fehler beim Laden des Mealplans', err);
            setError('Fehler beim Laden des Mealplans');
            setEntries([]); // Clear entries on fetch error
            setLoading(false);
          }
        }
      } else if (token === null) {
        // Token is explicitly null (auth failed or no token from getIdToken in the previous effect)
        // State (entries, error, loading) should have been set by the token loading effect.
        // Ensure entries are clear if not already.
        if (isMounted && entries.length > 0) setEntries([]);
        // setLoading(false) and setError should be handled by the token effect.
      }
      // If token is undefined (initial state), do nothing, wait for token useEffect to set it.
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [token, weekOffset]);

  // Gericht hinzufügen
  const addEntry = async (entry: Omit<MealPlanEntry, 'id'>): Promise<MealPlanEntry | null> => {
    if (!token) return null;

    try {
      const res = await axios.post('/api/mealplan', entry, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newEntry = res.data;

      // ⬅️ Direkt ins lokale State einfügen
      setEntries((prev) => [...prev, newEntry]);

      return newEntry;
    } catch (error) {
      console.error('Fehler beim Hinzufügen eines Eintrags:', error);
      return null;
    }
  };

  // Gericht verschieben
  const updateEntry = async (id: number, updated: Partial<MealPlanEntry>) => {
    if (!token) return;
  
    const res = await axios.put(`/api/mealplan/${id}`, { ...updated, id }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setEntries((prev) => {
      const updatedEntry = res.data;
  
      const updatedList = prev.map((e) =>
        e.id === id ? { ...e, ...updatedEntry } : e
      );
  
      return sortMealPlanEntries(updatedList);
    });
  };

  // Gericht löschen
  const deleteEntry = async (id: number) => {
    if (!token) return;
  
    await axios.delete(`/api/mealplan/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return sortMealPlanEntries(filtered);
    });
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

