import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LikeButton } from "./LikeButton"; // Assuming LikeButton.tsx is in the same directory
import { useLogto } from "@logto/react";
import axios from "axios";
import type { Mock } from "vitest";

// Mock @logto/react
vi.mock("@logto/react", () => ({
  useLogto: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Typed mocks for better intellisense and type safety
const mockUseLogto = useLogto as Mock;
const mockAxiosGet = axios.get as Mock;
const mockAxiosPost = axios.post as Mock;

describe("LikeButton Component", () => {
  const mockGetIdToken = vi.fn();
  const recipeId = 123; // A valid recipe ID for testing

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    vi.clearAllMocks();
    mockUseLogto.mockReturnValue({ getIdToken: mockGetIdToken });

    // Default successful token mock: Simulates a logged-in user
    mockGetIdToken.mockResolvedValue("test-auth-token");
    // Default successful like status mock (recipe is initially not liked)
    mockAxiosGet.mockResolvedValue({ data: false });
    // Default successful post mock (for like/unlike actions)
    mockAxiosPost.mockResolvedValue({});
  });

  describe("Initial Rendering and State", () => {
    /**
     * @description Unit Test: Validates the initial rendering state of the LikeButton.
     * @context The component fetches an authentication token and the recipe's like status asynchronously upon mount.
     * During this data fetching period, a loading indicator (spinner) should be displayed to provide user feedback.
     * @expectedBehavior The LikeButton should render a spinner icon and be disabled, indicating an ongoing background process.
     * The button does not have an aria-label in this state.
     */
    it("should display a loading spinner initially", () => {
      render(<LikeButton recipeId={recipeId} />);
      
      // Query by role 'button' without a name, as aria-label="Like" is not present during initial loading.
      const button = screen.getByRole("button"); 
      expect(button).toBeDisabled();
      // Check for the spinner icon, which has a 'spin' class.
      expect(button.querySelector("svg.spin")).toBeInTheDocument();
    });

    /**
     * @description Unit Test: Validates rendering after successful data fetching when the recipe is not liked.
     * @context After the authentication token and like status are successfully fetched, if the recipe is not liked by the user,
     * the button should display an icon indicating it's not liked (e.g., an empty heart, FaRegHeart).
     * @expectedBehavior The button should display the 'not-liked' icon and be enabled for interaction.
     */
    it("should render as not liked after successful data fetching if recipe is not liked", async () => {
      mockAxiosGet.mockResolvedValue({ data: false }); // Explicitly set recipe as not liked
      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button).not.toBeDisabled();
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".liked-icon")).not.toBeInTheDocument();
    });

    /**
     * @description Unit Test: Validates rendering after successful data fetching when the recipe is liked.
     * @context After the authentication token and like status are successfully fetched, if the recipe is already liked by the user,
     * the button should display an icon indicating it's liked (e.g., a filled heart, FaHeart).
     * @expectedBehavior The button should display the 'liked' icon and be enabled for interaction.
     */
    it("should render as liked after successful data fetching if recipe is liked", async () => {
      mockAxiosGet.mockResolvedValue({ data: true }); // Explicitly set recipe as liked
      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button).not.toBeDisabled();
      expect(button.querySelector(".liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".not-liked-icon")).not.toBeInTheDocument();
    });
  });

  describe("Token and Like Status Fetching Logic", () => {
    /**
     * @description Error Handling Test: Validates behavior when fetching the authentication token fails.
     * @context The component relies on an auth token for API interactions. If token fetching fails (e.g., network issue, user not authenticated),
     * it should handle this gracefully. It should not attempt to fetch like status and should render in a default state.
     * @expectedBehavior Loading completes (no spinner). The button renders as 'not liked' (default). An error is logged.
     * No API call to fetch like status is made.
     */
    it("should handle token fetching failure gracefully", async () => {
      const tokenError = new Error("Token fetch failed");
      mockGetIdToken.mockRejectedValue(tokenError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".spin")).not.toBeInTheDocument(); // Spinner should be gone

      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", tokenError);
      expect(mockAxiosGet).not.toHaveBeenCalled(); // Like status API should not be called

      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Edge Case Test: Validates behavior when getIdToken returns undefined.
     * @context The Logto SDK's getIdToken might return undefined if no token is available (e.g., user not logged in).
     * The component should treat this as a failure to retrieve a token.
     * @expectedBehavior Similar to general token fetching failure: loading completes, renders as 'not liked', logs an error.
     * No attempt to fetch like status.
     */
    it("should handle getIdToken returning undefined", async () => {
      mockGetIdToken.mockResolvedValue(undefined);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".spin")).not.toBeInTheDocument();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Laden des Tokens", expect.any(Error));
      // Check the specific error message thrown by the component
      const actualError = consoleErrorSpy.mock.calls[0][1] as Error;
      expect(actualError.message).toBe("Token is undefined");
      expect(mockAxiosGet).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    /**
     * @description Prop Validation/Edge Case Test: Validates behavior with an invalid recipeId (e.g., 0).
     * @context The component requires a valid recipeId (greater than 0) to fetch like status.
     * If an invalid ID is provided, it should not attempt to fetch the like status.
     * IMPORTANT: This test reveals a potential issue in the component: if the token is fetched successfully
     * but recipeId is invalid, the `loading` state might not be correctly set to `false` by the second useEffect,
     * potentially leaving the spinner indefinitely. This test asserts the current behavior.
     * @expectedBehavior The component loads the token. If recipeId is invalid, it skips fetching like status. Spinner remains.
     */
    it("should display loading spinner indefinitely if recipeId is invalid and token is valid", async () => {
      const invalidRecipeId = 0;
      render(<LikeButton recipeId={invalidRecipeId} />);

      // Wait for token fetching attempt to complete
      await waitFor(() => expect(mockGetIdToken).toHaveBeenCalled());

      // Assert: Spinner should still be visible. Query button without specific name.
      const button = screen.getByRole("button");
      expect(button.querySelector("svg.spin")).toBeInTheDocument();
      expect(button).toBeDisabled(); // It should also be disabled in this loading state
      expect(mockAxiosGet).not.toHaveBeenCalled(); // No call to fetch like status.

      // Developer Note: The component's current logic does not set `loading` to `false` if
      // `getIdToken` succeeds but `recipeId <= 0` (as `fetchLikeStatus` bails early before its `finally` block).
      // This test confirms this behavior. A component fix would be to ensure `setLoading(false)` in this path.
    });
    
    /**
     * @description Error Handling Test: Validates behavior when fetching the like status from the API fails.
     * @context If fetching the like status fails (e.g., network error, server error),
     * the component should handle this error, log it, and default to a 'not liked' state.
     * @expectedBehavior Loading should complete (no spinner). An error is logged. The button renders as 'not liked'.
     */
    it("should handle failure when fetching like status and render as not liked", async () => {
      const likeStatusError = new Error("API error fetching like status");
      mockAxiosGet.mockRejectedValue(likeStatusError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".spin")).not.toBeInTheDocument();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Abrufen des Like-Status", likeStatusError);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("User Interactions - Toggling Like", () => {
    const user = userEvent.setup();

    /**
     * @description Integration Test: Simulates a user liking a recipe.
     * @context User clicks the like button when the recipe is not currently liked.
     * This action should trigger an API call to like the recipe and update the UI to reflect the new 'liked' state.
     * @expectedBehavior Button icon changes from 'not-liked' to 'liked'. A POST request is made to the like endpoint.
     * The button is temporarily disabled during the API call.
     */
    it("should allow user to like a recipe and update UI and API accordingly", async () => {
      mockAxiosGet.mockResolvedValue({ data: false }); // Initial state: not liked
      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();

      await user.click(button);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          `/api/recipe/${recipeId}/like`,
          null,
          { headers: { Authorization: `Bearer test-auth-token` } }
        );
      });
      expect(button.querySelector(".liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".not-liked-icon")).not.toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    /**
     * @description Integration Test: Simulates a user unliking a recipe.
     * @context User clicks the like button when the recipe is currently liked.
     * This action should trigger an API call to unlike the recipe and update the UI to reflect the new 'not liked' state.
     * @expectedBehavior Button icon changes from 'liked' to 'not-liked'. A POST request is made to the unlike endpoint.
     * The button is temporarily disabled during the API call.
     */
    it("should allow user to unlike a recipe and update UI and API accordingly", async () => {
      mockAxiosGet.mockResolvedValue({ data: true }); // Initial state: liked
      render(<LikeButton recipeId={recipeId} />);

      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".liked-icon")).toBeInTheDocument();

      await user.click(button);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          `/api/recipe/${recipeId}/unlike`,
          null,
          { headers: { Authorization: `Bearer test-auth-token` } }
        );
      });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".liked-icon")).not.toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    /**
     * @description Unit Test: Validates button's disabled state during API interaction for like/unlike.
     * @context When the user clicks the like/unlike button, an API call is made. During this call,
     * the button should be disabled to prevent multiple submissions or inconsistent states.
     * @expectedBehavior Button becomes disabled immediately on click (while `updating` is true)
     * and re-enabled after the API call completes. No spinner is shown during this update phase.
     */
    it("should disable the button during the like/unlike API call and re-enable it afterwards", async () => {
      mockAxiosGet.mockResolvedValue({ data: false }); // Initial state: not liked
      let resolvePost: (value: unknown) => void;
      mockAxiosPost.mockImplementation(() => new Promise(resolve => { resolvePost = resolve; }));
      
      render(<LikeButton recipeId={recipeId} />);
      const button = await screen.findByRole("button", { name: /like/i });

      user.click(button); // Do not await, to check intermediate state

      await waitFor(() => expect(button).toBeDisabled());
      // Verify no spinner is shown during this 'updating' state, only for initial 'loading'.
      expect(button.querySelector(".spin")).not.toBeInTheDocument();

      resolvePost!({}); // Simulate API call completion

      await waitFor(() => expect(button).not.toBeDisabled());
    });

    /**
     * @description Error Handling Test: Validates behavior when an API error occurs while trying to like a recipe.
     * @context User attempts to like a recipe, but the API call fails (e.g., server error).
     * The component updates its state *after* a successful API call, not optimistically before.
     * @expectedBehavior An error should be logged. The button should be re-enabled.
     * The UI should remain in the 'not-liked' state as the API call to like failed.
     */
    it("should handle API error when trying to like a recipe, and UI should remain in not-liked state", async () => {
      mockAxiosGet.mockResolvedValue({ data: false }); // Initial: not liked
      const likeError = new Error("API error liking recipe");
      mockAxiosPost.mockRejectedValue(likeError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      render(<LikeButton recipeId={recipeId} />);
      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();

      await user.click(button);

      expect(mockAxiosPost).toHaveBeenCalledWith(`/api/recipe/${recipeId}/like`, null, expect.any(Object));
      
      // UI should NOT change to 'liked' because the API call failed and setIsLiked is not called.
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".liked-icon")).not.toBeInTheDocument();
      expect(button).not.toBeDisabled(); // Button is re-enabled
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Umschalten des Like-Status", likeError);

      // Developer Note: The component calls setIsLiked only on successful API response.
      // If the API call fails, the state is not changed. This test confirms this behavior.
      consoleErrorSpy.mockRestore();
    });

     /**
     * @description Error Handling Test: Validates behavior when an API error occurs while trying to unlike a recipe.
     * @context User attempts to unlike a recipe, but the API call fails.
     * The component updates its state *after* a successful API call, not optimistically before.
     * @expectedBehavior An error should be logged. The button should be re-enabled.
     * The UI should remain in the 'liked' state as the API call to unlike failed.
     */
    it("should handle API error when trying to unlike a recipe, and UI should remain in liked state", async () => {
      mockAxiosGet.mockResolvedValue({ data: true }); // Initial: liked
      const unlikeError = new Error("API error unliking recipe");
      mockAxiosPost.mockRejectedValue(unlikeError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<LikeButton recipeId={recipeId} />);
      const button = await screen.findByRole("button", { name: /like/i });
      expect(button.querySelector(".liked-icon")).toBeInTheDocument();

      await user.click(button);

      expect(mockAxiosPost).toHaveBeenCalledWith(`/api/recipe/${recipeId}/unlike`, null, expect.any(Object));
      
      // UI should NOT change to 'not-liked' because the API call failed and setIsLiked is not called.
      expect(button.querySelector(".liked-icon")).toBeInTheDocument();
      expect(button.querySelector(".not-liked-icon")).not.toBeInTheDocument();
      expect(button).not.toBeDisabled(); // Button is re-enabled
      expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Umschalten des Like-Status", unlikeError);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility (a11y)", () => {
    /**
     * @description Accessibility Test: Ensures the button has an accessible name via aria-label.
     * @context Accessible names are crucial for screen reader users to understand the purpose of
     * interactive elements, especially for icon-only buttons.
     * @expectedBehavior The button should have an `aria-label="Like"`.
     */
    it("should have an accessible name (aria-label='Like')", async () => {
      render(<LikeButton recipeId={recipeId} />);
      const button = await screen.findByRole("button", { name: /like/i }); // Uses aria-label
      expect(button).toHaveAttribute("aria-label", "Like");
    });

    /**
     * @description Accessibility Test: Validates keyboard interactivity (focusable and activatable).
     * @context Interactive elements like buttons must be operable via keyboard. Users should be able
     * to tab to the button and activate it using Enter or Space keys.
     * @expectedBehavior The button should be focusable. Pressing Enter or Space when focused
     * should trigger the like/unlike action, similar to a mouse click.
     */
    it("should be focusable and interactive via keyboard (Enter/Space)", async () => {
      mockAxiosGet.mockResolvedValue({ data: false }); // Initial: not liked
      const user = userEvent.setup();
      render(<LikeButton recipeId={recipeId} />);
      const button = await screen.findByRole("button", { name: /like/i });

      // Test with Enter key
      button.focus();
      expect(button).toHaveFocus();
      await user.keyboard("{Enter}");

      await waitFor(() => expect(mockAxiosPost).toHaveBeenCalledWith(`/api/recipe/${recipeId}/like`, null, expect.any(Object)));
      expect(button.querySelector(".liked-icon")).toBeInTheDocument(); // UI updated to liked

      // Test with Space key (to unlike)
      mockAxiosPost.mockClear(); // Clear previous call to check the new one
      button.focus(); // Re-focus
      await user.keyboard("{ }"); // Space key

      await waitFor(() => expect(mockAxiosPost).toHaveBeenCalledWith(`/api/recipe/${recipeId}/unlike`, null, expect.any(Object)));
      expect(button.querySelector(".not-liked-icon")).toBeInTheDocument(); // UI updated to not-liked
    });
  });

  describe("Edge Cases and Other Behaviors", () => {
    /**
     * @description Edge Case Test: Validates that no action occurs if trying to toggle like without a token.
     * @context If the authentication token was successfully retrieved as `null` (not `undefined`, not an error),
     * the component currently gets stuck in a loading state because the second useEffect (for like status)
     * bails early and its `setLoading(false)` is not reached.
     * Clicking the button (which is disabled and loading) should not attempt any API calls.
     * @expectedBehavior The button remains in its loading state (disabled, spinner visible).
     * Clicking it does nothing; no API calls are made.
     */
    it("should not attempt API calls or UI changes if toggling like without a token (token is null, component stuck loading)", async () => {
      mockGetIdToken.mockResolvedValue(null); // Simulate token is null (not undefined, not an error)
      const user = userEvent.setup();
      // No consoleErrorSpy for "Fehler beim Laden des Tokens" here, as resolving to null doesn't trigger that specific error.

      render(<LikeButton recipeId={recipeId} />);
      
      // Wait for the token to be processed.
      // The component will call setToken(null) and remain in loading state.
      await waitFor(() => expect(mockGetIdToken).toHaveBeenCalled());

      // Query the button by role only, as it's stuck in loading and has no aria-label.
      const button = screen.getByRole("button");
      
      // Assert it's in the stuck loading state
      expect(button).toBeDisabled();
      expect(button.querySelector("svg.spin")).toBeInTheDocument();

      // Attempt to click the disabled button (userEvent might not dispatch click on disabled,
      // but good to ensure no side effects if it somehow did, or if it weren't disabled)
      await user.click(button, { skipPointerEventsCheck: true }); // Allow clicking disabled for test purpose if needed

      expect(mockAxiosPost).not.toHaveBeenCalled();
      // UI remains in loading state
      expect(button.querySelector("svg.spin")).toBeInTheDocument(); 
      expect(button).toBeDisabled();

      // Developer Note: This test reflects current component behavior where `loading` isn't set to `false`
      // if `getIdToken` resolves to `null` because the second `useEffect` (for like status) returns early
      // and its `finally` block containing `setLoading(false)` is not executed.
    });
  });
});
