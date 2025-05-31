import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeCard from "./RecipeCard";
import { Recipe, Difficulty } from "../../types/recipe"; // Import Difficulty enum
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock RecipeImage component to simplify testing and focus on RecipeCard logic
vi.mock("../RecipeImage/RecipeImage.tsx", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="recipe-image" />
  ),
}));

// Mock LikeButton component
// This allows us to control its behavior and verify interactions
// without depending on its actual implementation.
// Updated mock to include a child span for more specific interaction testing.
vi.mock("../LikeButton/LikeButton.tsx", () => ({
  LikeButton: ({ recipeId }: { recipeId: string }) => (
    <button className="like-button" data-testid="like-button">
      <span data-testid="like-icon">Icon</span> {/* Child element for testing clicks within LikeButton */}
      Like {recipeId}
    </button>
  ),
}));

/**
 * @describe RecipeCard Component Tests
 * This suite tests the RecipeCard component, ensuring it renders correctly,
 * handles user interactions as expected, and adheres to accessibility basics.
 */
describe("RecipeCard Component", () => {
  // Define a mock recipe object to be used across tests.
  // This represents a typical recipe data structure the component would receive.
  const mockRecipe: Recipe = {
    id: 1, // Changed from string "1" to number 1
    name: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish.", // Added optional field
    imageUrl: "carbonara.jpg",
    ingredients: [], // Kept as empty array, structure matches type if populated
    instructions: "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine.", // Changed from [] to string
    portionCount: 4, // Renamed from servings
    difficulty: Difficulty.Easy, // Used Difficulty enum
    caloriesPerServing: 600, // Added required field
    // Removed: prepTime, cookTime, cuisine, tags, ratings, averageRating, author, isLiked, nutrition
    categories: [{ category: { id: 1, name: "Italian" } }], // Added optional field
  };

  // Define a mock onSelect function to track its calls.
  // This is crucial for testing interaction-driven props.
  const mockOnSelect = vi.fn();

  // Reset mocks before each test to ensure test isolation.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @describe Rendering Tests
   * These tests verify that the RecipeCard component renders its constituent parts
   * correctly based on the provided props.
   */
  describe("Rendering", () => {
    it("should render the recipe name", () => {
      // Test: Verifies that the recipe's name is correctly displayed.
      // Why: Essential for users to identify the recipe.
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
      expect(screen.getByText(mockRecipe.name)).toBeInTheDocument();
    });

    it("should render the RecipeImage with correct src and alt attributes", () => {
      // Test: Ensures the recipe image is rendered and has appropriate alt text.
      // Why: Visual appeal and accessibility for screen readers.
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
      const image = screen.getByTestId("recipe-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", mockRecipe.imageUrl);
      expect(image).toHaveAttribute("alt", mockRecipe.name);
    });

    it("should render the LikeButton component", () => {
      // Test: Confirms the LikeButton is part of the card.
      // Why: User interaction for liking recipes is a core feature.
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
      expect(screen.getByTestId("like-button")).toBeInTheDocument();
    });

    it("should apply default classes when compact prop is false or not provided", () => {
      // Test: Checks for default styling classes.
      // Why: Ensures consistent default appearance.
      const { container } = render(
        <RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />
      );
      // The first child of the container is the recipe-card div
      expect(container.firstChild).toHaveClass("recipe-card");
      expect(container.firstChild).not.toHaveClass("recipe-card--compact");
    });

    it("should apply compact class when compact prop is true", () => {
      // Test: Verifies compact styling is applied when requested.
      // Why: Supports different layout needs (e.g., dense lists).
      const { container } = render(
        <RecipeCard
          recipe={mockRecipe}
          onSelect={mockOnSelect}
          compact={true}
        />
      );
      expect(container.firstChild).toHaveClass(
        "recipe-card",
        "recipe-card--compact"
      );
    });
  });

  /**
   * @describe Interaction Tests
   * These tests simulate user interactions with the RecipeCard component
   * and verify the expected outcomes, such as callback invocations.
   */
  describe("Interactions", () => {
    it("should call onSelect when the card (excluding LikeButton) is clicked", async () => {
      // Test: Simulates a user clicking the main card area.
      // Why: Core navigation/selection functionality.
      const user = userEvent.setup();
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);

      const cardElement = screen.getByText(mockRecipe.name).closest(".recipe-card");
      expect(cardElement).toBeInTheDocument(); // Ensure we found the card

      if (cardElement) {
        await user.click(cardElement);
      }
      
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onSelect when the LikeButton is clicked", async () => {
      // Test: Simulates a user clicking the LikeButton specifically.
      // Why: Ensures that clicking the LikeButton does not trigger the card's
      // primary onSelect action, allowing the LikeButton to handle its own event.
      const user = userEvent.setup();
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
      
      const likeButton = screen.getByTestId("like-button");
      await user.click(likeButton);
      
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it("should NOT call onSelect when a child of LikeButton is clicked", async () => {
        // Test: Simulates a user clicking an element inside the LikeButton.
        // Why: This is a more robust check for the event bubbling prevention logic.
        // The `closest('.like-button')` check should handle this.
        const user = userEvent.setup();
        
        render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
        
        const likeIcon = screen.getByTestId("like-icon");
        await user.click(likeIcon);
        
        expect(mockOnSelect).not.toHaveBeenCalled();
      });
  });

  /**
   * @describe Accessibility Tests
   * These tests check for basic accessibility (a11y) features.
   * While not exhaustive, they cover key aspects controlled by RecipeCard.
   */
  describe("Accessibility", () => {
    it("should have an alt attribute on the recipe image for screen readers", () => {
      // Test: Ensures the image has descriptive alt text.
      // Why: Critical for users relying on screen readers to understand image content.
      render(<RecipeCard recipe={mockRecipe} onSelect={mockOnSelect} />);
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", mockRecipe.name);
    });

    // Note on further accessibility:
    // - Focusability: The `div` with `onClick` is inherently focusable if it were a `button`
    //   or had `tabindex="0"`. For a `div`, focusability and keyboard operation (`Enter`/`Space` key)
    //   would typically require explicit `tabindex="0"` and `onKeyDown` handlers.
    //   This component relies on mouse click; keyboard navigation would be an enhancement.
    // - ARIA roles: If the card acts as a link or button, appropriate ARIA roles
    //   (e.g., `role="button"` or `role="link"`) could be added.
    //   Currently, it's a generic clickable div.
    // - The LikeButton component should have its own accessibility tests (e.g., aria-pressed).
  });

  // Note on coverage:
  // - The primary logic paths of RecipeCard (rendering based on props, click handling) are covered.
  // - Edge cases like missing recipe props (e.g., `recipe.name` being undefined) would ideally
  //   be handled by TypeScript at compile time or with prop-types in JavaScript,
  //   but runtime checks/graceful degradation could be tested if implemented.
  // - The internal implementations of `RecipeImage` and `LikeButton` are mocked,
  //   so their specific behaviors are not tested here, which is appropriate for unit/integration
  //   testing of `RecipeCard` itself.
});
