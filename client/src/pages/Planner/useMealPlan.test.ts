import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMealPlan, MealPlanEntry } from "./useMealPlan";
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";
import { mealType } from "../../types/mealType"; // Assuming this path and enum export
import { sortMealPlanEntries } from "../../utils/sortMealPlanEntries";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Mock sortMealPlanEntries utility
vi.mock("../../utils/sortMealPlanEntries", () => ({
  sortMealPlanEntries: vi.fn((entries) => entries), // Default mock returns entries as is
}));

// Typed mocks
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;
const mockAxiosPost = axios.post as Mock;
const mockAxiosPut = axios.put as Mock;
const mockAxiosDelete = axios.delete as Mock;
const mockSortMealPlanEntries = sortMealPlanEntries as Mock;

const mockRecipeDetails = {
  id: 101,
  name: "Scrambled Eggs",
  imageUrl: "http://example.com/scrambled_eggs.jpg",
};

const mockMealPlanEntry1: MealPlanEntry = {
  id: 1,
  recipeId: mockRecipeDetails.id,
  date: "2024-07-01",
  mealType: mealType.Breakfast,
  position: 0,
  recipe: mockRecipeDetails,
};

const mockMealPlanEntry2: MealPlanEntry = {
  id: 2,
  recipeId: 102,
  date: "2024-07-01",
  mealType: mealType.Lunch,
  position: 1,
  recipe: {
    id: 102,
    name: "Chicken Salad",
    imageUrl: "http://example.com/chicken_salad.jpg",
  },
};

describe("useMealPlan Hook", () => {
  const mockGetIdToken = vi.fn();
  const mockToken = "test-auth-token";
  const initialWeekOffset = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1] }); // Default GET response
    mockSortMealPlanEntries.mockImplementation((entries) => entries); 
  });

  describe("Initial State and Token Loading", () => {
    /**
     * @description Unit Test: Validates the initial state of the hook and subsequent loading completion.
     * @context When the hook is first rendered, it attempts to load a token and then data.
     * @expectedBehavior `loading` is true initially, then false. `entries` is populated or an error is set.
     */
    it("should return correct initial state, attempt to load token, and complete loading", async () => {
      const { result } = renderHook(() => useMealPlan(initialWeekOffset));

      // Assertions for the very initial synchronous state
      expect(result.current.entries).toEqual([]);
      expect(result.current.loading).toBe(true); // True due to initial useState(true) and token loading effect
      expect(result.current.error).toBeNull();
      expect(mockGetIdToken).toHaveBeenCalledTimes(1);

      // Wait for the initial loading process (token and data) to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      // Assert state after successful initial load (based on default mocks)
      expect(result.current.entries).toEqual([mockMealPlanEntry1]);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails.
     * @context The `getIdToken` call rejects during initial token loading.
     * @expectedBehavior `loading` becomes false, `error` is set to "Authentifizierung fehlgeschlagen". `axios.get` for entries is not called.
     */
    it("should handle getIdToken failure during initial load", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));

      // Expect loading to be true initially, then false after error
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.entries).toEqual([]);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled(); 
      expect(consoleErrorSpy).toHaveBeenCalledWith("Token-Fehler:", tokenError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Edge Case Test: Validates behavior when `getIdToken` returns undefined/null.
     * @context The `getIdToken` call resolves with `undefined` or `null`.
     * @expectedBehavior `loading` becomes false, `error` is set. `axios.get` for entries is not called.
     */
    it("should handle getIdToken returning undefined/null during initial load", async () => {
      mockGetIdToken.mockResolvedValue(null); // Simulate undefined or null token
      // const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // No console.error for null token in new logic

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.entries).toEqual([]);
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");
      expect(mockAxiosGet).not.toHaveBeenCalled();
      // consoleErrorSpy.mockRestore();
    });
  });

  describe("Fetching Meal Plan Entries", () => {
    /**
     * @description Integration Test: Validates successful fetching of meal plan entries.
     * @context After a token is successfully obtained, entries are fetched.
     * @expectedBehavior `loading` becomes false, `entries` is populated, `error` remains null. `axios.get` is called with correct parameters.
     */
    it("should fetch and set meal plan entries successfully after token is loaded", async () => {
      const mockEntries = [mockMealPlanEntry1, mockMealPlanEntry2];
      mockAxiosGet.mockResolvedValue({ data: mockEntries });

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith("/api/mealplan", {
        params: { weekOffset: initialWeekOffset },
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result.current.entries).toEqual(mockEntries);
      expect(result.current.error).toBeNull();
    });

    /**
     * @description Error Handling Test: Validates behavior when API call for entries fails.
     * @context The `axios.get` call to fetch entries rejects.
     * @expectedBehavior `loading` becomes false, `error` is set, `entries` remains empty.
     */
    it("should handle API error during fetchEntries", async () => {
      const apiError = new Error("API fetch failed");
      mockAxiosGet.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.entries).toEqual([]);
      expect(result.current.error).toBe("Fehler beim Laden des Mealplans");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Mealplans", apiError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Adding Meal Plan Entries", () => {
    const newEntryData: Omit<MealPlanEntry, "id"> = {
      recipeId: 200,
      date: "2024-07-02",
      mealType: mealType.Dinner,
      position: 0,
    };
    const newEntryResponse: MealPlanEntry = {
      ...newEntryData,
      id: 3,
      recipe: { id: 200, name: "New Recipe", imageUrl: "new.jpg" },
    };

    /**
     * @description Integration Test: Validates successful addition of a meal plan entry.
     * @context User adds a new entry, and the API call is successful.
     * @expectedBehavior `axios.post` is called, `entries` state is updated with the new entry (appended). The function returns the new entry.
     */
    it("should add a meal plan entry successfully", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1] }); // Initial entries
      mockAxiosPost.mockResolvedValue({ data: newEntryResponse });

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for initial load

      let addedEntry: MealPlanEntry | null = null;
      await act(async () => {
        addedEntry = await result.current.addEntry(newEntryData);
      });

      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
      expect(mockAxiosPost).toHaveBeenCalledWith("/api/mealplan", newEntryData, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result.current.entries).toEqual([mockMealPlanEntry1, newEntryResponse]); // Appended
      expect(addedEntry).toEqual(newEntryResponse);
      expect(mockSortMealPlanEntries).not.toHaveBeenCalled(); // addEntry does not sort
    });

    /**
     * @description Error Handling Test: Validates behavior when API call for adding an entry fails.
     * @context The `axios.post` call to add an entry rejects.
     * @expectedBehavior `error` state is not set by `addEntry` directly (it logs), `entries` state remains unchanged. The function returns null.
     */
    it("should handle API error when adding an entry", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1] });
      const apiError = new Error("API add failed");
      mockAxiosPost.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let addedEntry: MealPlanEntry | null = null;
      await act(async () => {
        addedEntry = await result.current.addEntry(newEntryData);
      });
      
      expect(result.current.entries).toEqual([mockMealPlanEntry1]); // State unchanged
      expect(addedEntry).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Hinzufügen eines Eintrags:", apiError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Edge Case Test: Validates behavior when trying to add an entry without a token.
     * @context `addEntry` is called when the token is not available.
     * @expectedBehavior `axios.post` is not called. The function returns null.
     */
    it("should not add an entry if token is not available", async () => {
      mockGetIdToken.mockResolvedValue(null); // Simulate no token
      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      
      // Wait for initial loading to complete; error state should be set due to token issue.
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Authentifizierung fehlgeschlagen");


      let addedEntry: MealPlanEntry | null = null;
      // Use act for calling addEntry as it might lead to state updates if it were successful
      // Though in this case, it bails out early.
      await act(async () => {
        addedEntry = await result.current.addEntry(newEntryData);
      });

      expect(mockAxiosPost).not.toHaveBeenCalled();
      expect(addedEntry).toBeNull();
      expect(result.current.entries).toEqual([]); // Entries should be empty due to auth failure
    });
  });

  describe("Updating Meal Plan Entries", () => {
    const entryToUpdateId = mockMealPlanEntry1.id;
    const updatePayload: Partial<MealPlanEntry> = { mealType: mealType.Snack1, position: 5 };
    const updatedEntryResponse: MealPlanEntry = {
      ...mockMealPlanEntry1,
      ...updatePayload,
    };

    /**
     * @description Integration Test: Validates successful update of a meal plan entry.
     * @context User updates an existing entry, and the API call is successful.
     * @expectedBehavior `axios.put` is called. `entries` state is updated with the modified entry. `sortMealPlanEntries` is called.
     */
    it("should update a meal plan entry successfully", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1, mockMealPlanEntry2] });
      mockAxiosPut.mockResolvedValue({ data: updatedEntryResponse });
    mockSortMealPlanEntries.mockImplementation(
      (entries: MealPlanEntry[]): MealPlanEntry[] =>
        entries.sort((a: MealPlanEntry, b: MealPlanEntry) => a.position - b.position)
    );


      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateEntry(entryToUpdateId, updatePayload);
      });

      expect(mockAxiosPut).toHaveBeenCalledTimes(1);
      expect(mockAxiosPut).toHaveBeenCalledWith(
        `/api/mealplan/${entryToUpdateId}`,
        { ...updatePayload, id: entryToUpdateId },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      
      // The updated list before sorting would be [updatedEntryResponse, mockMealPlanEntry2]
      // Then sortMealPlanEntries is called with this list.
      expect(mockSortMealPlanEntries).toHaveBeenCalledTimes(1);
      const expectedSortedList = [mockMealPlanEntry2, updatedEntryResponse].sort((a,b) => a.position - b.position); // mockMealPlanEntry2 (pos 1), updatedEntryResponse (pos 5)
      expect(result.current.entries).toEqual(expectedSortedList);
    });

    /**
     * @description Error Handling Test: Validates behavior when API call for updating an entry fails.
     * @context The `axios.put` call to update an entry rejects.
     * @expectedBehavior `error` state is not set by `updateEntry`. `entries` state remains unchanged from before the call.
     */
    it("should handle API error when updating an entry", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1, mockMealPlanEntry2] });
      const apiError = new Error("API update failed");
      mockAxiosPut.mockRejectedValue(apiError);
      // const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Axios might log this

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const originalEntries = result.current.entries;

      await act(async () => {
        try {
          await result.current.updateEntry(entryToUpdateId, updatePayload);
        } catch (e) {
          // Expected to throw due to axios error
          expect(e).toBe(apiError);
        }
      });
      
      expect(result.current.entries).toEqual(originalEntries); // State unchanged on error
      // consoleErrorSpy.mockRestore(); // If console spy was used
    });
  });

  describe("Deleting Meal Plan Entries", () => {
    const entryToDeleteId = mockMealPlanEntry1.id;

    /**
     * @description Integration Test: Validates successful deletion of a meal plan entry.
     * @context User deletes an existing entry, and the API call is successful.
     * @expectedBehavior `axios.delete` is called. `entries` state is updated (entry removed). `sortMealPlanEntries` is called.
     */
    it("should delete a meal plan entry successfully", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1, mockMealPlanEntry2] });
      mockAxiosDelete.mockResolvedValue({}); // Successful delete usually returns 204 No Content or similar

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteEntry(entryToDeleteId);
      });

      expect(mockAxiosDelete).toHaveBeenCalledTimes(1);
      expect(mockAxiosDelete).toHaveBeenCalledWith(
        `/api/mealplan/${entryToDeleteId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      
      expect(mockSortMealPlanEntries).toHaveBeenCalledTimes(1);
      expect(mockSortMealPlanEntries).toHaveBeenCalledWith([mockMealPlanEntry2]); // Called with filtered list
      expect(result.current.entries).toEqual([mockMealPlanEntry2]);
    });

    /**
     * @description Error Handling Test: Validates behavior when API call for deleting an entry fails.
     * @context The `axios.delete` call to delete an entry rejects.
     * @expectedBehavior `error` state is not set by `deleteEntry`. `entries` state remains unchanged.
     */
    it("should handle API error when deleting an entry", async () => {
      mockAxiosGet.mockResolvedValue({ data: [mockMealPlanEntry1, mockMealPlanEntry2] });
      const apiError = new Error("API delete failed");
      mockAxiosDelete.mockRejectedValue(apiError);

      const { result } = renderHook(() => useMealPlan(initialWeekOffset));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const originalEntries = result.current.entries;

      await act(async () => {
        try {
          await result.current.deleteEntry(entryToDeleteId);
        } catch (e) {
          expect(e).toBe(apiError);
        }
      });
      
      expect(result.current.entries).toEqual(originalEntries);
    });
  });

  describe("Dependency and Re-fetching Behavior", () => {
    /**
     * @description Integration Test: Validates re-fetching when `weekOffset` changes.
     * @context The hook is rendered, then re-rendered with a new `weekOffset`.
     * @expectedBehavior `axios.get` is called again with the new `weekOffset`. `entries` are updated.
     */
    it("should re-fetch entries when 'weekOffset' changes", async () => {
      const initialData = [mockMealPlanEntry1];
      const newData = [mockMealPlanEntry2];
      mockAxiosGet.mockResolvedValueOnce({ data: initialData }); // First call

      const { result, rerender } = renderHook(
        ({ offset }) => useMealPlan(offset),
        { initialProps: { offset: initialWeekOffset } }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenLastCalledWith("/api/mealplan", expect.objectContaining({ params: { weekOffset: initialWeekOffset } }));
      expect(result.current.entries).toEqual(initialData);

      const newWeekOffset = 1;
      mockAxiosGet.mockResolvedValueOnce({ data: newData }); // Mock for the re-fetch
      mockGetIdToken.mockClear(); // Clear to ensure it's not called again unnecessarily

      rerender({ offset: newWeekOffset });

      // Expect loading to become true during re-fetch, then false.
      // waitFor will handle the transition.
      await waitFor(() => {
        expect(result.current.loading).toBe(false); // Wait for re-fetch to complete
        // Check that getIdToken was NOT called again just for weekOffset change
        expect(mockGetIdToken).not.toHaveBeenCalled(); 
      });
      
      expect(mockAxiosGet).toHaveBeenCalledTimes(2); // Called again for the new fetch
      expect(mockAxiosGet).toHaveBeenLastCalledWith("/api/mealplan", expect.objectContaining({ params: { weekOffset: newWeekOffset } }));
      expect(result.current.entries).toEqual(newData);
    });

    /**
     * @description Integration Test: Validates re-fetching when `getIdToken` function reference changes.
     * @context The `getIdToken` function, a dependency of `useEffect`, changes its reference.
     * @expectedBehavior The hook should re-fetch data. `getIdToken` (new instance) is called, then `axios.get`. Loading states transition correctly.
     */
    it("should re-fetch if getIdToken function reference changes", async () => {
        mockAxiosGet.mockResolvedValueOnce({ data: [mockMealPlanEntry1] }); // Initial fetch

        const { result, rerender } = renderHook(
            ({ getIdTokenFunc }) => {
                mockUseLogto.mockReturnValue({ getIdToken: getIdTokenFunc });
                return useMealPlan(initialWeekOffset);
            },
            { initialProps: { getIdTokenFunc: mockGetIdToken } }
        );

        await waitFor(() => expect(result.current.loading).toBe(false)); // Initial load done
        expect(result.current.entries).toEqual([mockMealPlanEntry1]);
        
        // Clear mocks before the action that triggers re-fetch
        mockGetIdToken.mockClear(); 
        mockAxiosGet.mockClear();

        const newGetIdTokenMock = vi.fn().mockResolvedValue("new-test-token");
        const newMockData = [mockMealPlanEntry2];
        mockAxiosGet.mockResolvedValueOnce({ data: newMockData }); // Mock for the re-fetch

        // Rerender with the new getIdToken function. RTL's rerender is wrapped in act.
        rerender({ getIdTokenFunc: newGetIdTokenMock });
        
        // Wait for the re-fetch process to complete (loading becomes true then false)
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Assertions after re-fetch is complete
        expect(newGetIdTokenMock).toHaveBeenCalledTimes(1); // The new mock should be called
        expect(mockAxiosGet).toHaveBeenCalledTimes(1); // Called once since last clear
        expect(mockAxiosGet).toHaveBeenCalledWith(
            "/api/mealplan",
            { 
                params: { weekOffset: initialWeekOffset },
                headers: { Authorization: `Bearer new-test-token` } 
            }
        );
        expect(result.current.entries).toEqual(newMockData);
        expect(result.current.error).toBeNull(); // Assuming successful re-fetch
    });
  });
});
