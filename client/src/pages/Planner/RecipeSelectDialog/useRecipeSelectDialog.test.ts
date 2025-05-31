import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { useLogto } from '@logto/react';
import { useRecipeSelectDialog } from './useRecipeSelectDialog';
import { Recipe, Difficulty } from '../../../types/recipe';

// Mock dependencies
vi.mock('axios');
vi.mock('@logto/react');

const mockGetIdToken = vi.fn();
const mockAxiosGet = vi.mocked(axios.get);

const mockRecipesData: Recipe[] = [
  { id: 1, name: 'Apple Pie', instructions: 'Bake it', portionCount: 1, difficulty: Difficulty.Easy, caloriesPerServing: 300 },
  { id: 2, name: 'Banana Bread', instructions: 'Mix and bake', portionCount: 1, difficulty: Difficulty.Easy, caloriesPerServing: 250 },
  { id: 3, name: 'Cherry Cake', instructions: 'Layer it', portionCount: 1, difficulty: Difficulty.Medium, caloriesPerServing: 400 },
];

describe('useRecipeSelectDialog Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLogto as vi.Mock).mockReturnValue({ getIdToken: mockGetIdToken });
  });

  // Test Suite: Initial State and Token Handling
  describe('Initial State and Token Handling', () => {
    it('should initialize with loading true, empty recipes, and null error', () => {
      mockGetIdToken.mockResolvedValue('test-token'); // Prevent immediate error state
      const { result } = renderHook(() => useRecipeSelectDialog(true));
      expect(result.current.loading).toBe(true);
      expect(result.current.recipes).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should set error and stop loading if getIdToken fails (returns null)', async () => {
      mockGetIdToken.mockResolvedValue(null);
      const { result } = renderHook(() => useRecipeSelectDialog(true));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Authentifizierung fehlgeschlagen'); // Authentication failed
      expect(result.current.recipes).toEqual([]);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should set error and stop loading if getIdToken throws an error', async () => {
      mockGetIdToken.mockRejectedValue(new Error('Token fetch failed'));
      const { result } = renderHook(() => useRecipeSelectDialog(true));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Authentifizierung fehlgeschlagen'); // Authentication failed
      expect(result.current.recipes).toEqual([]);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });
  });

  // Test Suite: Recipe Fetching
  describe('Recipe Fetching', () => {
    it('should not fetch recipes if visible is false, even with a token', async () => {
      mockGetIdToken.mockResolvedValue('test-token');
      renderHook(() => useRecipeSelectDialog(false));

      // Wait for token effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // allow microtasks to run
      });
      
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should fetch recipes when token is available and visible is true', async () => {
      mockGetIdToken.mockResolvedValue('test-token');
      mockAxiosGet.mockResolvedValue({ data: mockRecipesData });

      const { result } = renderHook(() => useRecipeSelectDialog(true));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.recipes).toEqual(mockRecipesData);
      expect(result.current.error).toBeNull();
      expect(mockAxiosGet).toHaveBeenCalledWith('/api/recipe/sorted-by-name', {
        headers: { Authorization: 'Bearer test-token' },
      });
    });

    it('should set error if fetching recipes fails', async () => {
      mockGetIdToken.mockResolvedValue('test-token');
      mockAxiosGet.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useRecipeSelectDialog(true));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Fehler beim Laden der Rezepte'); // Error loading recipes
      expect(result.current.recipes).toEqual([]);
    });

    it('should fetch recipes when visibility changes from false to true', async () => {
      mockGetIdToken.mockResolvedValue('test-token');
      mockAxiosGet.mockResolvedValue({ data: mockRecipesData });

      const { result, rerender } = renderHook(
        ({ visible }) => useRecipeSelectDialog(visible),
        { initialProps: { visible: false } }
      );

      // Initially not visible, no fetch
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(mockAxiosGet).not.toHaveBeenCalled();
      
      rerender({ visible: true });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.recipes).toEqual(mockRecipesData);
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    });
  });

  // Test Suite: Search Functionality
  describe('Search Functionality', () => {
    beforeEach(() => {
      mockGetIdToken.mockResolvedValue('test-token');
      mockAxiosGet.mockResolvedValue({ data: mockRecipesData });
    });

    it('should update search state and filter recipes accordingly', async () => {
      const { result } = renderHook(() => useRecipeSelectDialog(true));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.recipes).toEqual(mockRecipesData); // Initial full list

      act(() => {
        result.current.setSearch('Apple');
      });

      expect(result.current.search).toBe('Apple');
      expect(result.current.recipes).toEqual([mockRecipesData[0]]); // Only Apple Pie

      act(() => {
        result.current.setSearch('bread'); // Case-insensitive
      });
      expect(result.current.search).toBe('bread');
      expect(result.current.recipes).toEqual([mockRecipesData[1]]); // Only Banana Bread

      act(() => {
        result.current.setSearch(''); // Empty search
      });
      expect(result.current.search).toBe('');
      expect(result.current.recipes).toEqual(mockRecipesData); // All recipes
    });

    it('should return empty array if search term matches no recipes', async () => {
      const { result } = renderHook(() => useRecipeSelectDialog(true));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.setSearch('NonExistentRecipe');
      });
      expect(result.current.recipes).toEqual([]);
    });
  });
});
