import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RecipeModal from './RecipeModal';
import { Recipe, Difficulty, Ingredient } from '../../../../types/recipe';

// Mock data for a recipe, ensuring all fields used by the component are present
// and conforming to the Recipe type.
const mockMinimalIngredient: Ingredient = {
  id: 1,
  name: 'Test Ingredient',
  price: 1.0,
  caloriesPer100g: 100,
  protein: 10,
  fat: 5,
  carbs: 5,
  // imageUrl is optional
};

const mockRecipe: Recipe = {
  id: 123, // Changed from string 'recipe-123' to number
  name: 'Delicious Test Dish',
  imageUrl: 'https://example.com/test-dish.jpg',
  portionCount: 4,
  caloriesPerServing: 350,
  difficulty: Difficulty.Easy, // Changed from string 'Easy' to enum
  instructions: '1. Mix ingredients. 2. Bake at 180°C. 3. Enjoy!',
  description: 'A very delicious test dish for testing purposes.', // Optional field added
  ingredients: [ // Updated structure and types
    {
      ingredient: mockMinimalIngredient,
      quantity: 1, // Changed from string '1' to number
      unit: 'cup',
    },
  ],
  categories: [ // Optional field added for type completeness
    { category: { id: 1, name: 'Test Category' } },
  ],
  // Removed fields not present in Recipe type: tags, prepTimeMinutes, cookTimeMinutes
};

describe('RecipeModal Component', () => {
  // Test suite for the RecipeModal component.
  // This suite verifies that the modal correctly displays recipe information
  // and handles user interactions for closing the modal as expected.

  it('should render all recipe details correctly when a recipe object is provided', () => {
    // Test case: Validates that all parts of the recipe data are rendered in the modal.
    // Business context: Users must be ableable to see comprehensive details of a selected recipe
    // to make informed decisions (e.g., about cooking it).
    const handleCloseMock = vi.fn();
    render(<RecipeModal recipe={mockRecipe} onClose={handleCloseMock} />);

    // Verify recipe name is displayed as a heading.
    expect(screen.getByRole('heading', { name: mockRecipe.name })).toBeInTheDocument();

    // Verify recipe image is rendered with correct src and alt text.
    // This assumes RecipeImage component renders an <img> tag.
    const imageElement = screen.getByAltText(mockRecipe.name) as HTMLImageElement;
    expect(imageElement).toBeInTheDocument();
    expect(imageElement.src).toBe(mockRecipe.imageUrl);

    // Verify portion count is displayed.
    // The text is split, so we find the label and check the parent <p> element's text content.
    const portionLabel = screen.getByText('Portionen:');
    expect(portionLabel.closest('p')).toHaveTextContent(`Portionen: ${mockRecipe.portionCount}`);

    // Verify calories per serving are displayed.
    // Similar approach for calories.
    const caloriesLabel = screen.getByText('Kalorien:');
    expect(caloriesLabel.closest('p')).toHaveTextContent(`Kalorien: ${mockRecipe.caloriesPerServing} kcal`);

    // Verify difficulty level is displayed.
    // Similar approach for difficulty.
    const difficultyLabel = screen.getByText('Schwierigkeit:');
    expect(difficultyLabel.closest('p')).toHaveTextContent(`Schwierigkeit: ${mockRecipe.difficulty}`);

    // Verify instructions are displayed.
    expect(screen.getByText(mockRecipe.instructions)).toBeInTheDocument();

    // Verify the "Close" button is present. (Text "Schließen" is German as per component)
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
  });

  it('should call the onClose callback when the "Schließen" (Close) button is clicked', async () => {
    // Test case: Ensures the primary close mechanism (the button) functions correctly.
    // Business context: Users expect a clear and functional way to dismiss modal dialogs.
    const handleCloseMock = vi.fn();
    const user = userEvent.setup();
    render(<RecipeModal recipe={mockRecipe} onClose={handleCloseMock} />);

    const closeButton = screen.getByRole('button', { name: 'Schließen' });
    await user.click(closeButton);

    // Assert that the onClose function was called exactly once.
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should call the onClose callback when the modal overlay (background) is clicked', async () => {
    // Test case: Verifies that clicking the modal's backdrop closes it.
    // Business context: This is a common and expected UX pattern for modals, providing an
    // alternative way to dismiss the dialog without interacting with specific controls.
    const handleCloseMock = vi.fn();
    const user = userEvent.setup();

    // The `render` method returns a container; its first child is the root element of RecipeModal.
    const { container } = render(<RecipeModal recipe={mockRecipe} onClose={handleCloseMock} />);
    const overlayElement = container.firstChild as HTMLElement;

    // Verify that we've selected the correct overlay element.
    expect(overlayElement).toHaveClass('recipe-modal');

    await user.click(overlayElement);

    // Assert that the onClose function was called exactly once.
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should not call the onClose callback when the modal content area is clicked', async () => {
    // Test case: Ensures that clicks within the modal's content area do not inadvertently close it.
    // This relies on event.stopPropagation() being correctly implemented on the content div.
    // Business context: Users should be able to interact with modal content (e.g., select text, scroll)
    // without accidentally closing the dialog.
    const handleCloseMock = vi.fn();
    const user = userEvent.setup();
    render(<RecipeModal recipe={mockRecipe} onClose={handleCloseMock} />);

    // Click on an element known to be within the modal content, e.g., the recipe name.
    const recipeNameElement = screen.getByRole('heading', { name: mockRecipe.name });
    await user.click(recipeNameElement);

    // Assert that the onClose function was NOT called.
    expect(handleCloseMock).not.toHaveBeenCalled();

    // As an additional check, one could target the `recipe-modal-content` div directly
    // if it had a test-id, or by its class name, though clicking a child element is often sufficient.
    // const contentDiv = screen.getByText(mockRecipe.instructions).parentElement; // Example: get parent of instructions
    // if (contentDiv) await user.click(contentDiv);
    // expect(handleCloseMock).not.toHaveBeenCalled();
  });

  // Accessibility (A11y) Considerations:
  // - The modal uses a button with clear text ("Schließen") for closing.
  // - The image includes `alt` text, which is good for screen readers.
  // - For a fully accessible modal, additional ARIA attributes (e.g., `role="dialog"`, `aria-modal="true"`,
  //   `aria-labelledby`, `aria-describedby`) and focus management (trapping focus within the modal)
  //   would be important. These aspects are typically handled by the modal component itself or a
  //   modal library. This test suite focuses on the RecipeModal's specific content and interactions.

  // Code Coverage Notes:
  // - These tests cover the rendering of all dynamic data points from the `recipe` prop.
  // - All explicit user interactions (close button click, overlay click, content click) are tested.
  // - The `onClose` prop functionality is thoroughly verified.
  // - The component's structure is simple, with no complex conditional rendering paths beyond
  //   what's implicitly handled by displaying the recipe data.
  // - This suite should achieve high coverage for the RecipeModal.tsx component.
});
