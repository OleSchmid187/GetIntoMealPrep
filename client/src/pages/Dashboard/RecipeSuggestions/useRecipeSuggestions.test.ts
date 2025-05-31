import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRecipeSuggestions } from "./useRecipeSuggestions";
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";
import { Recipe, Difficulty } from "../../../types/recipe";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Typed mocks
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;

describe("useRecipeSuggestions Hook", () => {
  const mockGetIdToken = vi.fn();
  const initialCount = 3;
  const mockToken = "test-auth-token";
  const mockRecipes: Recipe[] = [
    { id: 1, name: "Recipe 1", description: "Desc 1", instructions: "Do this 1", portionCount: 2, difficulty: Difficulty.Easy, caloriesPerServing: 300, imageUrl: "url1", ingredients: [], categories: [] },
    { id: 2, name: "Recipe 2", description: "Desc 2", instructions: "Do this 2", portionCount: 4, difficulty: Difficulty.Medium, caloriesPerServing: 500, imageUrl: "url2", ingredients: [], categories: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    mockAxiosGet.mockResolvedValue({ data: mockRecipes });
  });

  describe("Initial State and Fetching Recipes", () => {
    /**
     * @description Unit Test: Validates the initial state of the hook.
     * @context When the hook is first rendered, it should be in a loading state,
     * with `recipes` being an empty array and `error` being null.
     * @expectedBehavior `loading` is true, `recipes` is an empty array, `error` is null.
     */
    it("should return correct initial state", () => {
      const { result } = renderHook(() => useRecipeSuggestions(initialCount));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Integration Test: Validates successful fetching of recipes.
     * @context The hook fetches an ID token and then uses it to fetch recipes.
     * @expectedBehavior `loading` becomes false, `recipes` is populated with data from the API, `error` remains null.
     * `getIdToken` and `axios.get` are called with correct parameters.
     */
    it("should fetch token and then recipes successfully", async () => {
      const { result } = renderHook(() => useRecipeSuggestions(initialCount));

      // Wait for loading to finish, which implies token and recipes have been fetched.
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/random?count=${initialCount}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipes).toEqual(mockRecipes);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails.
     * @context If fetching the auth token fails.
     * @expectedBehavior `loading` becomes false, `recipes` remains empty, `error` is set to "Authentication failed".
     * `axios.get` is not called.
     */
    it("should handle getIdToken failure", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useRecipeSuggestions(initialCount));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen"); // As per hook's German error message
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", tokenError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined.
     * @context If `getIdToken` resolves to undefined (e.g., user not logged in or token not available).
     * The hook explicitly throws an error in this case.
     * @expectedBehavior `loading` becomes false, `recipes` remains empty, `error` is set to "Authentication failed".
     * `axios.get` is not called.
     */
    it("should handle getIdToken returning undefined", async () => {
      mockGetIdToken.mockResolvedValue(undefined);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useRecipeSuggestions(initialCount));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", new Error("Token is undefined"));
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `axios.get` for recipes fails.
     * @context The token is fetched successfully, but the API call to fetch recipes fails.
     * @expectedBehavior `loading` becomes false, `recipes` remains empty, `error` is set to "Error loading recipes".
     */
    it("should handle API error during recipe fetch", async () => {
      const apiError = new Error("API fetch failed");
      mockAxiosGet.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useRecipeSuggestions(initialCount));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]); // Should be empty or initial state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Fehler beim Laden der Rezepte"); // As per hook's German error message
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden der Rezepte", apiError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Dependency Handling", () => {
    /**
     * @description Unit Test: Validates re-fetching when `count` prop changes.
     * @context The hook is rendered with one `count`, then re-rendered with a new `count`.
     * @expectedBehavior The hook should re-fetch recipes with the new count. `loading` should become true during the re-fetch,
     * then false. `axios.get` should be called again with the new count.
     * Note: The current hook implementation does not reset loading to true when dependencies change if a token already exists.
     * It will only set loading to false once the new data arrives or an error occurs.
     * This test will reflect the current behavior.
     */
    it("should re-fetch recipes when count changes", async () => {
      // Reset mockAxiosGet to ensure a clean slate for this test's sequential mocking.
      // This clears any mock implementation (like the one from beforeEach) and call history.
      // mockAxiosGet.mockReset(); // This line will be removed.

      // Define behavior for the first call to axios.get (initial render)
      // Note: beforeEach already calls vi.clearAllMocks() which clears call history.
      // beforeEach also sets a default mockAxiosGet.mockResolvedValue({ data: mockRecipes }).
      // The mockResolvedValueOnce calls below will queue up and take precedence.
      mockAxiosGet.mockResolvedValueOnce({ data: mockRecipes });

      const { result, rerender } = renderHook(
        ({ count }) => useRecipeSuggestions(count),
        { initialProps: { count: initialCount } }
      );

      // Initial fetch
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/random?count=${initialCount}`,
        expect.any(Object)
      );
      expect(result.current.recipes).toEqual(mockRecipes);

      const newCount = 5;
      const newMockRecipes: Recipe[] = [{ id: 3, name: "Recipe 3", description: "Desc 3", instructions: "Do this 3", portionCount: 1, difficulty: Difficulty.Hard, caloriesPerServing: 400, imageUrl: "url3", ingredients: [], categories: [] }];
      
      // Define behavior for the second call to axios.get (after rerender with new count)
      mockAxiosGet.mockResolvedValueOnce({ data: newMockRecipes });

      act(() => {
        rerender({ count: newCount });
      });
      
      // The hook will set loading to true internally when the effect for recipes runs again due to `count` change,
      // but this happens before `waitFor` can observe it if the API call is fast.
      // We expect loading to be false after the new data is fetched.
      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          `/api/recipe/random?count=${newCount}`,
          expect.any(Object)
        );
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recipes).toEqual(newMockRecipes);
      expect(mockAxiosGet).toHaveBeenCalledTimes(2); // Once for initial, once for rerender
      expect(mockGetIdToken).toHaveBeenCalledTimes(1); // Token is fetched only once initially
    });

     /**
     * @description Edge Case Test: Validates behavior if token is not available when count changes.
     * @context The hook is rendered, token fetch fails initially. Then `count` prop changes.
     * @expectedBehavior The hook should not attempt to fetch recipes as the token is still missing/invalid.
     * The error state from the initial token fetch failure should persist.
     */
    it("should not re-fetch recipes if token was not available and count changes", async () => {
      mockGetIdToken.mockRejectedValueOnce(new Error("Initial token failure"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result, rerender } = renderHook(
        ({ count }) => useRecipeSuggestions(count),
        { initialProps: { count: initialCount } }
      );

      // Initial fetch fails due to token
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled();

      const newCount = 5;
      act(() => {
        rerender({ count: newCount });
      });

      // Wait for a short period to ensure no new calls are made
      await new Promise(resolve => setTimeout(resolve, 50));


      // State should remain as it was after the initial failure
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(result.current.recipes).toEqual([]);
      expect(mockAxiosGet).not.toHaveBeenCalled(); // Still should not have been called
      expect(mockGetIdToken).toHaveBeenCalledTimes(1); // Only the initial attempt

      consoleErrorSpy.mockRestore();
    });
  });
});
