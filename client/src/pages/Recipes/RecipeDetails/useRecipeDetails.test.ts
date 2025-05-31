import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRecipeDetails } from "./useRecipeDetails";
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

describe("useRecipeDetails Hook", () => {
  const mockGetIdToken = vi.fn();
  const initialRecipeId = 1;
  const mockToken = "test-auth-token";

  const mockRecipeData: Omit<Recipe, "ingredients"> = {
    id: initialRecipeId,
    name: "Test Recipe",
    instructions: "Test instructions",
    portionCount: 2,
    difficulty: Difficulty.Easy,
    caloriesPerServing: 300,
  };

  const mockIngredientsData = [
    { id: 1, name: "Ingredient A", quantity: 100, unit: "g" },
    { id: 2, name: "Ingredient B", quantity: 2, unit: "pcs" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    // Default successful responses
    mockAxiosGet
      .mockResolvedValueOnce({ data: mockRecipeData }) // For recipe
      .mockResolvedValueOnce({ data: mockIngredientsData }); // For ingredients
  });

  describe("Initial State and Data Fetching", () => {
    /**
     * @description Unit Test: Validates the initial synchronous state of the hook and ensures all initial effects complete.
     * @context When the hook is first rendered, it should exhibit its synchronous initial state.
     *          This test also waits for all initial asynchronous operations (token and data fetching) to complete
     *          to prevent "act" warnings and ensure the hook settles to its loaded state.
     * @expectedBehavior `loading` is true initially, then becomes false. `recipe`, `ingredients` are populated, `error` is null.
     */
    it("should return correct initial state and then fetch data successfully", async () => {
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      // Assert the synchronous initial state immediately after render
      expect(result.current.recipe).toBeNull();
      expect(result.current.ingredients).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Wait for all initial effects (token fetching, data fetching) to complete.
      // This ensures state updates are processed and avoids "act" warnings.
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Assert state after successful data load
      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/ingredients`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipe).toEqual({ ...mockRecipeData, ingredients: mockIngredientsData });
      expect(result.current.ingredients).toEqual(mockIngredientsData);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Integration Test: Validates successful fetching of recipe and ingredients data.
     * @context The hook fetches token, then recipe and ingredients data on mount.
     * @expectedBehavior `loading` becomes false, `recipe` and `ingredients` are populated, `error` is null.
     * `getIdToken` and `axios.get` (twice) are called with correct parameters.
     */
    it("should fetch and set recipe and ingredients data successfully", async () => {
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/ingredients`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipe).toEqual({ ...mockRecipeData, ingredients: mockIngredientsData });
      expect(result.current.ingredients).toEqual(mockIngredientsData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Unit Test: Validates behavior when recipeId is invalid (e.g., 0) and token is fetched successfully.
     * @context The hook is called with recipeId <= 0. Token fetching is successful.
     * @expectedBehavior `loading` remains true because the data fetching effect bails out before its `finally` block.
     * No API calls for recipe/ingredients are made. `recipe` remains null, `ingredients` empty, `error` null.
     */
    it("should not fetch data if recipeId is 0 or less, and loading remains true if token is fetched successfully", async () => {
      // mockGetIdToken is configured in beforeEach to resolve successfully with mockToken.
      const { result } = renderHook(() => useRecipeDetails(0));

      // Wait for the token fetching effect to run.
      // getIdToken will be called. Since it's mocked to succeed, setToken will be called.
      // The catch block in the token effect (which calls setLoading(false)) will not be hit.
      await waitFor(() => expect(mockGetIdToken).toHaveBeenCalledTimes(1));

      // The data fetching effect will run next because `token` is now set.
      // However, since recipeId is 0, it will return early: `if (!token || recipeId <= 0) return;`
      // The `load()` async function within this effect (which has a finally block to set loading to false)
      // will NOT be called.
      // Therefore, `loading` state, which was initialized to `true` and not changed by the successful token effect,
      // will remain `true`.
      expect(result.current.loading).toBe(true);
      expect(mockAxiosGet).not.toHaveBeenCalled(); // No API calls for recipe/ingredients
      expect(result.current.recipe).toBeNull();
      expect(result.current.ingredients).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Error Handling", () => {
    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails.
     * @context If fetching the auth token fails.
     * @expectedBehavior `loading` becomes false, `error` is set to "Authentifizierung fehlgeschlagen".
     * `recipe` and `ingredients` remain in their initial state. `axios.get` is not called.
     */
    it("should handle getIdToken failure", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipe).toBeNull();
      expect(result.current.ingredients).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", tokenError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined.
     * @context If `getIdToken` resolves to undefined (e.g., user not logged in).
     * @expectedBehavior `loading` becomes false, `error` is set to "Authentifizierung fehlgeschlagen".
     * `recipe` and `ingredients` remain in their initial state. `axios.get` is not called.
     */
    it("should handle getIdToken returning undefined", async () => {
      mockGetIdToken.mockResolvedValue(undefined);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipe).toBeNull();
      expect(result.current.ingredients).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", new Error("Token is undefined"));
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when fetching recipe data fails.
     * @context The API call to fetch recipe details fails.
     * @expectedBehavior `loading` becomes false, `error` is set to "Fehler beim Laden der Daten".
     * `recipe` and `ingredients` might be partially set or remain null/empty depending on Promise.all behavior.
     */
    it("should handle API error when fetching recipe data", async () => {
      const apiError = new Error("Recipe API fetch failed");
      mockAxiosGet
        .mockReset() // Clear previous default mocks
        .mockImplementation(async (url: string) => {
          if (url.includes("/ingredients")) {
            return { data: mockIngredientsData };
          }
          throw apiError; // Fail for recipe data
        });
      mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken }); // Re-apply logto mock
      mockGetIdToken.mockResolvedValue(mockToken); // Re-apply token mock


      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipe).toBeNull(); // Or partially set depending on exact error point
      expect(result.current.ingredients).toEqual([]); // Or partially set
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Fehler beim Laden der Daten");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden der Daten", apiError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when fetching ingredients data fails.
     * @context The API call to fetch ingredients data fails.
     * @expectedBehavior `loading` becomes false, `error` is set to "Fehler beim Laden der Daten".
     */
    it("should handle API error when fetching ingredients data", async () => {
      const apiError = new Error("Ingredients API fetch failed");
       mockAxiosGet
        .mockReset()
        .mockImplementation(async (url: string) => {
          if (url.endsWith(`/${initialRecipeId}`)) { // Recipe call
            return { data: mockRecipeData };
          }
          throw apiError; // Fail for ingredients data
        });
      mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
      mockGetIdToken.mockResolvedValue(mockToken);


      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeDetails(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipe).toBeNull();
      expect(result.current.ingredients).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Fehler beim Laden der Daten");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden der Daten", apiError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Dependency Handling", () => {
    /**
     * @description Unit Test: Validates re-fetching when `recipeId` changes.
     * @context The hook is rendered with one `recipeId`, then re-rendered with a new `recipeId`.
     * @expectedBehavior The hook should re-fetch data for the new `recipeId`.
     * `getIdToken` is called only once initially. `axios.get` is called for the new ID.
     * `recipe` and `ingredients` are updated. `loading` becomes false after the new fetch.
     */
    it("should re-fetch data when recipeId changes", async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useRecipeDetails(id),
        { initialProps: { id: initialRecipeId } }
      );

      // Initial fetch
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledTimes(2); // Recipe + Ingredients for initialRecipeId
      expect(result.current.recipe?.id).toBe(initialRecipeId);
      expect(mockGetIdToken).toHaveBeenCalledTimes(1); // Called once for the initial load

      // Clear axios mocks for the next set of calls, but not getIdToken mock count
      mockAxiosGet.mockClear();

      // Prepare mocks for the new recipeId
      const newRecipeId = 2;
      const newMockRecipeData = { ...mockRecipeData, id: newRecipeId, name: "New Recipe" };
      const newMockIngredientsData = [{ id: 3, name: "Ingredient C", quantity: 1, unit: "cup" }];

      // Reset axiosGet mocks and set them up for the new calls
      mockAxiosGet
        .mockResolvedValueOnce({ data: newMockRecipeData })    // For new recipe
        .mockResolvedValueOnce({ data: newMockIngredientsData }); // For new ingredients
      
      // Token is already available from the initial load; getIdToken effect won't re-run.
      // mockGetIdToken.mockResolvedValue(mockToken); // Not needed to set again

      act(() => {
        rerender({ id: newRecipeId });
      });
      
      // Wait for the new data to be loaded.
      // The hook's current implementation doesn't reset loading to true explicitly on recipeId change
      // if the token is already present. The `load` function's finally block will set it to false.
      await waitFor(() => {
        // Check if the recipe data has been updated to the new recipeId,
        // implying the loading for the new ID has completed.
        expect(result.current.recipe?.id).toBe(newRecipeId);
      }, { timeout: 2000 });
      expect(result.current.loading).toBe(false); // Assert loading is false after new data is set

      expect(mockGetIdToken).toHaveBeenCalledTimes(1); // Should still be 1; token effect doesn't re-run
      expect(mockAxiosGet).toHaveBeenCalledTimes(2); // Recipe + Ingredients for the new ID
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${newRecipeId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${newRecipeId}/ingredients`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipe?.id).toBe(newRecipeId);
      expect(result.current.recipe?.name).toBe("New Recipe");
      expect(result.current.ingredients).toEqual(newMockIngredientsData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
