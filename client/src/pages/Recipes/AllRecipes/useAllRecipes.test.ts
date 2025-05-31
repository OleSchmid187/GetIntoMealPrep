import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAllRecipes } from "./useAllRecipes";
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";
import { Difficulty, type Recipe } from "../../../types/recipe";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Typed mocks
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;

describe("useAllRecipes Hook", () => {
  const mockGetIdToken = vi.fn();
  const initialStart = 0;
  const initialLimit = 10;
  const mockToken = "test-auth-token";

  const mockRecipesPage1: Recipe[] = [
    { id: 1, name: "Pasta Carbonara", instructions: "Cook pasta...", portionCount: 2, difficulty: Difficulty.Easy, caloriesPerServing: 500 },
    { id: 2, name: "Chicken Curry", instructions: "Cook chicken...", portionCount: 4, difficulty: Difficulty.Medium, caloriesPerServing: 650 },
  ];
  const mockTotalRecipes = 25;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    // Default successful response for axios.get
    mockAxiosGet.mockResolvedValue({
      data: { data: [], total: 0 },
    });
  });

  describe("Initial State and Data Fetching", () => {
    /**
     * @description Unit Test: Validates the initial state of the hook upon mounting.
     * @context When the hook is first rendered, it should immediately set `loading` to true
     * and initialize other state variables to their defaults before attempting to fetch data.
     * @expectedBehavior `loading` is true, `recipes` is an empty array, `error` is null, and `total` is 0.
     */
    it("should return correct initial state before data fetching completes", () => {
      const { result } = renderHook(() => useAllRecipes(initialStart, initialLimit));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.total).toBe(0);
    });

    /**
     * @description Integration Test: Validates successful fetching and setting of recipes.
     * @context The hook attempts to fetch recipes on mount. If the API call is successful.
     * @expectedBehavior `loading` becomes false, `recipes` array is populated, `total` is updated,
     * and `error` remains null. `getIdToken` and `axios.get` should be called with correct parameters.
     */
    it("should fetch and set recipes successfully", async () => {
      mockAxiosGet.mockResolvedValue({
        data: { data: mockRecipesPage1, total: mockTotalRecipes },
      });
      const { result } = renderHook(() => useAllRecipes(initialStart, initialLimit));

      // Wait for loading to complete
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe?start=${initialStart}&limit=${initialLimit}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipes).toEqual(mockRecipesPage1);
      expect(result.current.total).toBe(mockTotalRecipes);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Error Handling", () => {
    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails.
     * @context If fetching the authentication token fails during the data fetch process.
     * @expectedBehavior `loading` becomes false, `recipes` remains empty, `total` remains 0,
     * and `error` is set to a relevant message. `axios.get` should not be called.
     * A console error should be logged.
     */
    it("should handle getIdToken failure", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useAllRecipes(initialStart, initialLimit));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Error loading recipes");
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading recipes", tokenError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined.
     * @context If `getIdToken` resolves to undefined (e.g., user not logged in), the subsequent API call might fail.
     * This test simulates `axios.get` failing because of the undefined token.
     * @expectedBehavior `loading` becomes false, `recipes` empty, `total` 0, `error` set.
     * `axios.get` is called with `Bearer undefined`. A console error is logged.
     */
    it("should handle getIdToken returning undefined leading to API call failure", async () => {
      mockGetIdToken.mockResolvedValue(undefined); // Token is undefined
      const axiosError = new Error("API call failed due to undefined token");
      mockAxiosGet.mockRejectedValueOnce(axiosError); // Simulate axios.get failing
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useAllRecipes(initialStart, initialLimit));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Error loading recipes");
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe?start=${initialStart}&limit=${initialLimit}`,
        { headers: { Authorization: `Bearer undefined` } }
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading recipes", axiosError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `axios.get` API call fails.
     * @context If the API call to fetch recipes fails for reasons other than token issues (e.g., server error).
     * @expectedBehavior `loading` becomes false, `recipes` remains empty, `total` remains 0,
     * and `error` is set. A console error should be logged.
     */
    it("should handle API error during fetch", async () => {
      const apiError = new Error("API fetch failed");
      mockAxiosGet.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useAllRecipes(initialStart, initialLimit));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Error loading recipes");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading recipes", apiError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Dependency Handling (Pagination)", () => {
    /**
     * @description Integration Test: Validates re-fetching when `start` or `limit` parameters change.
     * @context The hook is rendered with initial pagination parameters, then re-rendered with new parameters.
     * @expectedBehavior The hook should set `loading` to true, then re-fetch data using the new parameters.
     * `recipes` and `total` should be updated based on the new API response. `axios.get` should be called
     * for both initial and subsequent fetches with respective parameters.
     */
    it("should re-fetch recipes when start or limit changes", async () => {
      // Initial fetch setup
      mockAxiosGet.mockResolvedValueOnce({
        data: { data: mockRecipesPage1, total: mockTotalRecipes },
      });
      const { result, rerender } = renderHook(
        ({ start, limit }) => useAllRecipes(start, limit),
        { initialProps: { start: initialStart, limit: initialLimit } }
      );

      // Wait for initial fetch to complete
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe?start=${initialStart}&limit=${initialLimit}`,
        expect.any(Object)
      );
      expect(result.current.recipes).toEqual(mockRecipesPage1);
      expect(result.current.total).toBe(mockTotalRecipes);

      // New parameters and mock data for re-fetch
      const newStart = 10;
      const newLimit = 5;
      const mockRecipesPage2: Recipe[] = [
        { id: 3, name: "Salad Nicoise", instructions: "Assemble salad...", portionCount: 1, difficulty: Difficulty.Easy, caloriesPerServing: 300 },
      ];
      const newTotalRecipes = 15; // Assuming total might change if filtering implies different dataset size
      mockAxiosGet.mockResolvedValueOnce({
        data: { data: mockRecipesPage2, total: newTotalRecipes },
      });

      // Rerender with new props
      act(() => {
        rerender({ start: newStart, limit: newLimit });
      });
      
      // Expect loading to be true immediately after prop change and before new data arrives
      expect(result.current.loading).toBe(true);

      // Wait for re-fetch to complete
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(2); // Called for initial fetch and re-fetch
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
      expect(mockAxiosGet).toHaveBeenNthCalledWith(2,
        `/api/recipe?start=${newStart}&limit=${newLimit}`,
        expect.any(Object)
      );
      expect(result.current.recipes).toEqual(mockRecipesPage2);
      expect(result.current.total).toBe(newTotalRecipes);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
