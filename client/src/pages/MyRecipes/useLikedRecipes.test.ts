import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLikedRecipes } from "./useLikedRecipes";
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";
import { Recipe, Difficulty } from "../../types/recipe";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Typed mocks
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;

const mockRecipe1: Recipe = {
  id: 1,
  name: "Liked Recipe 1",
  instructions: "Cook it well",
  portionCount: 2,
  difficulty: Difficulty.Easy,
  caloriesPerServing: 300,
  imageUrl: "http://example.com/liked1.jpg",
};

const mockRecipe2: Recipe = {
  id: 2,
  name: "Liked Recipe 2",
  instructions: "Bake it nicely",
  portionCount: 4,
  difficulty: Difficulty.Medium,
  caloriesPerServing: 500,
  imageUrl: "http://example.com/liked2.jpg",
};

describe("useLikedRecipes Hook", () => {
  const mockGetIdToken = vi.fn();
  const mockToken = "test-auth-token";
  const initialFirst = 0;
  const initialRecipesPerPage = 10;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    // Default successful response
    mockAxiosGet.mockResolvedValue({
      data: { data: [mockRecipe1], total: 1 },
    });
  });

  describe("Initial State and Fetching Liked Recipes", () => {
    /**
     * @description Unit Test: Validates the initial state of the hook before any async operations complete.
     * @context When the hook is first rendered, it should immediately set loading to true and return default values for other states.
     * @expectedBehavior `loading` is true, `recipes` is an empty array, `error` is null, and `total` is 0.
     */
    it("should return correct initial state", () => {
      const { result } = renderHook(() =>
        useLikedRecipes(initialFirst, initialRecipesPerPage)
      );

      expect(result.current.recipes).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.total).toBe(0);
    });

    /**
     * @description Integration Test: Validates successful fetching and setting of liked recipes.
     * @context The hook fetches liked recipes on mount. The API call is successful.
     * @expectedBehavior `loading` becomes false, `recipes` is populated with data from API, `total` is updated, `error` remains null. `getIdToken` and `axios.get` are called with correct parameters.
     */
    it("should fetch and set liked recipes successfully", async () => {
      const mockRecipes = [mockRecipe1, mockRecipe2];
      const mockTotal = 2;
      mockAxiosGet.mockResolvedValue({
        data: { data: mockRecipes, total: mockTotal },
      });

      const { result } = renderHook(() =>
        useLikedRecipes(initialFirst, initialRecipesPerPage)
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/favorites?start=${initialFirst}&limit=${initialRecipesPerPage}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.recipes).toEqual(mockRecipes);
      expect(result.current.total).toBe(mockTotal);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails.
     * @context If fetching the auth token fails during the recipes fetch.
     * @expectedBehavior `loading` becomes false, `error` is set to a specific message, `recipes` remains empty, `total` remains 0. `axios.get` is not called. An error is logged to the console.
     */
    it("should handle getIdToken failure", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useLikedRecipes(initialFirst, initialRecipesPerPage)
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBe("Fehler beim Laden der Rezepte.");
      expect(result.current.loading).toBe(false);
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading liked recipes",
        tokenError
      );
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined.
     * @context If `getIdToken` resolves to undefined (e.g., user not logged in), leading to an invalid API request.
     * @expectedBehavior `loading` becomes false, `error` is set. `axios.get` is called with an undefined token, which should ideally be handled by the API or axios interceptors, but here we simulate axios failing.
     */
    it("should handle getIdToken returning undefined", async () => {
        mockGetIdToken.mockResolvedValue(undefined);
        const axiosError = new Error("Request failed due to undefined token");
        mockAxiosGet.mockRejectedValueOnce(axiosError); // Simulate axios failure
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const { result } = renderHook(() => useLikedRecipes(initialFirst, initialRecipesPerPage));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.recipes).toEqual([]);
        expect(result.current.total).toBe(0);
        expect(result.current.error).toBe("Fehler beim Laden der Rezepte.");
        expect(mockAxiosGet).toHaveBeenCalledWith(
            `/api/recipe/favorites?start=${initialFirst}&limit=${initialRecipesPerPage}`,
            { headers: { Authorization: `Bearer undefined` } }
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading liked recipes", axiosError);
        consoleErrorSpy.mockRestore();
    });


    /**
     * @description Error Handling Test: Validates behavior when the API call (`axios.get`) fails.
     * @context If the API call to fetch liked recipes returns an error.
     * @expectedBehavior `loading` becomes false, `error` is set to a specific message, `recipes` remains empty, `total` remains 0. An error is logged to the console.
     */
    it("should handle API error during fetch", async () => {
      const apiError = new Error("API fetch failed");
      mockAxiosGet.mockRejectedValue(apiError);
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useLikedRecipes(initialFirst, initialRecipesPerPage)
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.recipes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBe("Fehler beim Laden der Rezepte.");
      expect(result.current.loading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading liked recipes",
        apiError
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Dependency Handling and Re-fetching", () => {
    /**
     * @description Integration Test: Validates re-fetching when `first` parameter changes.
     * @context The hook is rendered, then re-rendered with a new `first` value.
     * @expectedBehavior The hook should re-fetch data. `loading` becomes true then false. `axios.get` is called with the new `first` value. `recipes` and `total` are updated.
     */
    it("should re-fetch liked recipes when 'first' changes", async () => {
      const { result, rerender } = renderHook(
        ({ first, recipesPerPage }) => useLikedRecipes(first, recipesPerPage),
        { initialProps: { first: initialFirst, recipesPerPage: initialRecipesPerPage } }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenLastCalledWith(
        `/api/recipe/favorites?start=${initialFirst}&limit=${initialRecipesPerPage}`,
        expect.any(Object)
      );

      const newFirst = 5;
      const newMockRecipes = [mockRecipe2];
      const newMockTotal = 1;
      mockAxiosGet.mockResolvedValueOnce({ // Mock for the re-fetch
        data: { data: newMockRecipes, total: newMockTotal },
      });

      rerender({ first: newFirst, recipesPerPage: initialRecipesPerPage });

      expect(result.current.loading).toBe(true); // Should be loading again

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(2); // Called again for the new fetch
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
      expect(mockAxiosGet).toHaveBeenLastCalledWith(
        `/api/recipe/favorites?start=${newFirst}&limit=${initialRecipesPerPage}`,
        expect.any(Object)
      );
      expect(result.current.recipes).toEqual(newMockRecipes);
      expect(result.current.total).toBe(newMockTotal);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Integration Test: Validates re-fetching when `recipesPerPage` parameter changes.
     * @context The hook is rendered, then re-rendered with a new `recipesPerPage` value.
     * @expectedBehavior The hook should re-fetch data. `loading` becomes true then false. `axios.get` is called with the new `recipesPerPage` value. `recipes` and `total` are updated.
     */
    it("should re-fetch liked recipes when 'recipesPerPage' changes", async () => {
      const { result, rerender } = renderHook(
        ({ first, recipesPerPage }) => useLikedRecipes(first, recipesPerPage),
        { initialProps: { first: initialFirst, recipesPerPage: initialRecipesPerPage } }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);

      const newRecipesPerPage = 5;
      const newMockRecipes = [mockRecipe1]; // Potentially different data
      const newMockTotal = 1;
       mockAxiosGet.mockResolvedValueOnce({ // Mock for the re-fetch
        data: { data: newMockRecipes, total: newMockTotal },
      });

      rerender({ first: initialFirst, recipesPerPage: newRecipesPerPage });

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(2);
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
      expect(mockAxiosGet).toHaveBeenLastCalledWith(
        `/api/recipe/favorites?start=${initialFirst}&limit=${newRecipesPerPage}`,
        expect.any(Object)
      );
      expect(result.current.recipes).toEqual(newMockRecipes);
      expect(result.current.total).toBe(newMockTotal);
    });

     /**
     * @description Integration Test: Validates re-fetching when `getIdToken` function reference changes.
     * @context The `getIdToken` function, a dependency of `useEffect`, changes its reference.
     * @expectedBehavior The hook should re-fetch data as `getIdToken` is in the dependency array. `loading` becomes true then false.
     */
    it("should re-fetch if getIdToken function reference changes", async () => {
        const { result, rerender } = renderHook(
            ({ getIdTokenFunc }) => {
                // Simulate useLogto providing a new function instance
                mockUseLogto.mockReturnValue({ getIdToken: getIdTokenFunc });
                return useLikedRecipes(initialFirst, initialRecipesPerPage);
            },
            { initialProps: { getIdTokenFunc: mockGetIdToken } }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(mockAxiosGet).toHaveBeenCalledTimes(1);

        const newGetIdTokenMock = vi.fn().mockResolvedValue("new-test-token");
        mockAxiosGet.mockResolvedValueOnce({ // Mock for the re-fetch
            data: { data: [mockRecipe2], total: 1 },
        });

        rerender({ getIdTokenFunc: newGetIdTokenMock });

        expect(result.current.loading).toBe(true); // Should be loading again

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(newGetIdTokenMock).toHaveBeenCalledTimes(1); // The new mock should be called
        expect(mockAxiosGet).toHaveBeenCalledTimes(2);
         expect(mockAxiosGet).toHaveBeenLastCalledWith(
            `/api/recipe/favorites?start=${initialFirst}&limit=${initialRecipesPerPage}`,
            { headers: { Authorization: `Bearer new-test-token` } }
        );
        expect(result.current.recipes).toEqual([mockRecipe2]);
    });
  });
});
