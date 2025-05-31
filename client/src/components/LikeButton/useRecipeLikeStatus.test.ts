import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRecipeLikeStatus } from "./useRecipeLikeStatus";
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Typed mocks
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;
const mockAxiosPost = axios.post as Mock;

describe("useRecipeLikeStatus Hook", () => {
  const mockGetIdToken = vi.fn();
  const initialRecipeId = 1;
  const mockToken = "test-auth-token";

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });
    mockGetIdToken.mockResolvedValue(mockToken);
    mockAxiosGet.mockResolvedValue({ data: false }); // Default: not liked
    mockAxiosPost.mockResolvedValue({}); // Default: post succeeds
  });

  describe("Initial State and Fetching Like Status", () => {
    /**
     * @description Unit Test: Validates the initial state of the hook.
     * @context When the hook is first rendered, it should be in a loading state,
     * with `isLiked` and `updating` set to their default false values.
     * @expectedBehavior `loading` is true, `isLiked` is false, `updating` is false.
     */
    it("should return correct initial state", () => {
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      expect(result.current.isLiked).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.updating).toBe(false);
    });

    /**
     * @description Integration Test: Validates successful fetching of 'not liked' status.
     * @context The hook fetches the like status on mount. If the API indicates the recipe is not liked.
     * @expectedBehavior `loading` becomes false, `isLiked` is false. `getIdToken` and `axios.get` are called.
     */
    it("should fetch and set like status to false if recipe is not liked", async () => {
      mockAxiosGet.mockResolvedValue({ data: false });
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for loading to finish

      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/is-liked`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.isLiked).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    /**
     * @description Integration Test: Validates successful fetching of 'liked' status.
     * @context The hook fetches the like status on mount. If the API indicates the recipe is liked.
     * @expectedBehavior `loading` becomes false, `isLiked` is true.
     */
    it("should fetch and set like status to true if recipe is liked", async () => {
      mockAxiosGet.mockResolvedValue({ data: true });
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLiked).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails during initial fetch.
     * @context If fetching the auth token fails during the initial status fetch.
     * @expectedBehavior `loading` becomes false, `isLiked` remains false. An error is logged. `axios.get` is not called.
     */
    it("should handle getIdToken failure during initial fetch", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLiked).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Abrufen des Like-Status", tokenError);
      consoleErrorSpy.mockRestore();
    });
    
    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined during initial fetch.
     * @context If `getIdToken` resolves to undefined (e.g., user not logged in).
     * @expectedBehavior `loading` becomes false, `isLiked` remains false. An error is logged (axios will fail due to undefined token).
     */
    it("should handle getIdToken returning undefined during initial fetch", async () => {
      mockGetIdToken.mockResolvedValue(undefined); // Token is undefined
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      // Simulate axios.get throwing an error when token is undefined, as it's likely an invalid request
      const axiosError = new Error("Axios GET failed due to undefined token");
      mockAxiosGet.mockRejectedValueOnce(axiosError);

      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLiked).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/is-liked`,
        { headers: { Authorization: `Bearer undefined` } }
      );
      // Now we expect consoleErrorSpy to be called because we explicitly make axios.get fail
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Abrufen des Like-Status", axiosError);
      consoleErrorSpy.mockRestore();
    });


    /**
     * @description Error Handling Test: Validates behavior when `axios.get` fails during initial fetch.
     * @context If the API call to fetch like status fails.
     * @expectedBehavior `loading` becomes false, `isLiked` remains false. An error is logged.
     */
    it("should handle API error during initial fetch", async () => {
      const apiError = new Error("API fetch failed");
      mockAxiosGet.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLiked).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Abrufen des Like-Status", apiError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Toggling Like Status", () => {
    /**
     * @description Integration Test: Simulates liking a recipe.
     * @context The recipe is initially not liked. `toggleLike` is called.
     * @expectedBehavior `updating` becomes true then false. `isLiked` becomes true. `axios.post` called for liking.
     */
    it("should like a recipe successfully", async () => {
      // Initial state: not liked
      mockAxiosGet.mockResolvedValue({ data: false });
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch done

      expect(result.current.isLiked).toBe(false);

      act(() => {
        result.current.toggleLike();
      });

      expect(result.current.updating).toBe(true); // Immediately after calling toggleLike
      await waitFor(() => expect(result.current.updating).toBe(false)); // Wait for toggleLike async operations

      expect(mockGetIdToken).toHaveBeenCalledTimes(2); // Once for fetch, once for toggle
      expect(mockAxiosPost).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/like`,
        null,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.isLiked).toBe(true);
      expect(result.current.updating).toBe(false);
    });

    /**
     * @description Integration Test: Simulates unliking a recipe.
     * @context The recipe is initially liked. `toggleLike` is called.
     * @expectedBehavior `updating` becomes true then false. `isLiked` becomes false. `axios.post` called for unliking.
     */
    it("should unlike a recipe successfully", async () => {
      // Initial state: liked
      mockAxiosGet.mockResolvedValue({ data: true });
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch done

      expect(result.current.isLiked).toBe(true);

      act(() => {
        result.current.toggleLike();
      });

      expect(result.current.updating).toBe(true);
      await waitFor(() => expect(result.current.updating).toBe(false));

      expect(mockAxiosPost).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/unlike`,
        null,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result.current.isLiked).toBe(false);
      expect(result.current.updating).toBe(false);
    });

    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` fails during toggle.
     * @context `getIdToken` fails when `toggleLike` is called.
     * @expectedBehavior `updating` becomes true then false. `isLiked` state remains unchanged. Error logged. `axios.post` not called.
     */
    it("should handle getIdToken failure during toggleLike", async () => {
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch

      const tokenError = new Error("Token fetch failed for toggle");
      mockGetIdToken.mockRejectedValueOnce(tokenError); // Fail on the second call (toggle)
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      act(() => {
        result.current.toggleLike();
      });
      
      expect(result.current.updating).toBe(true);
      await waitFor(() => expect(result.current.updating).toBe(false));

      expect(result.current.isLiked).toBe(false); // Remains initial state
      expect(result.current.updating).toBe(false);
      expect(mockAxiosPost).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Umschalten des Like-Status", tokenError);
      consoleErrorSpy.mockRestore();
    });
    
    /**
     * @description Error Handling Test: Validates behavior when `getIdToken` returns undefined during toggle.
     * @context `getIdToken` resolves to undefined when `toggleLike` is called.
     * @expectedBehavior `updating` becomes true then false. `isLiked` state remains unchanged. Error logged. `axios.post` called with undefined token.
     */
    it("should handle getIdToken returning undefined during toggleLike", async () => {
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch

      mockGetIdToken.mockResolvedValueOnce(undefined); // Return undefined on the second call (toggle)
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      // Simulate axios.post throwing an error for undefined token
      const axiosPostError = new Error("Axios POST failed due to undefined token");
      mockAxiosPost.mockRejectedValueOnce(axiosPostError);


      act(() => {
        result.current.toggleLike();
      });
      
      expect(result.current.updating).toBe(true);
      await waitFor(() => expect(result.current.updating).toBe(false));

      // If axios.post fails, setIsLiked(!isLiked) should not be called.
      expect(result.current.isLiked).toBe(false); // Remains initial state (false)
      expect(result.current.updating).toBe(false);
      expect(mockAxiosPost).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/like`, // Assuming initial state was not liked
        null,
        { headers: { Authorization: `Bearer undefined` } }
      );
      // Expect consoleErrorSpy because axios.post is now mocked to fail
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Umschalten des Like-Status", axiosPostError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Error Handling Test: Validates behavior when `axios.post` fails during toggle.
     * @context API call fails when `toggleLike` is called.
     * @expectedBehavior `updating` becomes true then false. `isLiked` state remains unchanged. Error logged.
     */
    it("should handle API error during toggleLike", async () => {
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch

      const apiError = new Error("API toggle failed");
      mockAxiosPost.mockRejectedValue(apiError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      act(() => {
        result.current.toggleLike();
      });

      expect(result.current.updating).toBe(true);
      await waitFor(() => expect(result.current.updating).toBe(false));

      expect(result.current.isLiked).toBe(false); // Remains initial state
      expect(result.current.updating).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Umschalten des Like-Status", apiError);
      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Edge Case Test: Validates behavior when `toggleLike` is called while already updating.
     * @context `toggleLike` is called, and before it completes, it's called again.
     * @expectedBehavior The second call should be ignored. `axios.post` should only be called once for the first invocation.
     */
    it("should not do anything if toggleLike is called while already updating", async () => {
      const { result } = renderHook(() => useRecipeLikeStatus(initialRecipeId));
      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch

      let resolvePost: (value: unknown) => void;
      // Use mockReturnValueOnce with a new Promise
      mockAxiosPost.mockReturnValueOnce(new Promise(resolve => { resolvePost = resolve; }));

      act(() => {
        result.current.toggleLike(); // First call
      });
      
      expect(result.current.updating).toBe(true);
      
      act(() => {
        result.current.toggleLike(); // Second call while first is in progress
      });

      // Resolve the first post call
      act(() => {
        if (resolvePost) { // Check if resolvePost is assigned
          resolvePost({});
        } else {
          throw new Error("resolvePost was not assigned by the mock implementation.");
        }
      });
      await waitFor(() => expect(result.current.updating).toBe(false));

      expect(mockAxiosPost).toHaveBeenCalledTimes(1); // Should only be called once
      expect(result.current.isLiked).toBe(true); // UI updated based on first call
      expect(result.current.updating).toBe(false);
    });
  });

  describe("Dependency Handling", () => {
    /**
     * @description Unit Test: Validates re-fetching when `recipeId` changes.
     * @context The hook is rendered with one `recipeId`, then re-rendered with a new `recipeId`.
     * The current hook implementation does not set `loading` to true at the start of the effect re-run.
     * @expectedBehavior The hook should re-fetch. `loading` remains `false` from previous fetch, then becomes `false` again after new fetch.
     */
    it("should re-fetch like status when recipeId changes", async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useRecipeLikeStatus(id),
        { initialProps: { id: initialRecipeId } }
      );

      await waitFor(() => expect(result.current.loading).toBe(false)); // Initial fetch for initialRecipeId
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/api/recipe/${initialRecipeId}/is-liked`,
        expect.any(Object)
      );
      expect(result.current.loading).toBe(false);
      const initialIsLikedState = result.current.isLiked; // e.g. false

      const newRecipeId = 2;
      // Mock for the new recipeId fetch, ensure it's different from initial to see change
      mockAxiosGet.mockResolvedValueOnce({ data: !initialIsLikedState }); 

      rerender({ id: newRecipeId });
      // According to current hook logic, loading does not become true here. It's still false from previous fetch.
      expect(result.current.loading).toBe(false); 

      await waitFor(() => {
        // Check that the second call to axios.get was made with the new recipeId
        expect(mockAxiosGet).toHaveBeenNthCalledWith(2,
          `/api/recipe/${newRecipeId}/is-liked`,
          expect.any(Object)
        );
        // And that loading is false after this new fetch
        expect(result.current.loading).toBe(false);
      });

      // isLiked should reflect the status for newRecipeId
      expect(result.current.isLiked).toBe(!initialIsLikedState); 
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
    });
  });
});
