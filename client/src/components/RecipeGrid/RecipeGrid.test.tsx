import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import RecipeGrid from './RecipeGrid';
import { Recipe } from '../../types/recipe';

// Mock the RecipeCard component to isolate RecipeGrid logic.
// This allows us to verify props passed to RecipeCard and simulate interactions
// without depending on RecipeCard's internal implementation.
vi.mock('../RecipeCard/RecipeCard', () => ({
  // Default export for a functional component mock
  default: ({ recipe, compact, onSelect }: { recipe: Recipe; compact: boolean; onSelect: () => void }) => (
    <div
      data-testid={`recipe-card-${recipe.id}`}
      onClick={onSelect} // The onSelect here is the function passed from RecipeGrid's map, which is `() => onSelect(recipe)`
      data-compact={String(compact)} // Store compact prop as a string attribute for easy assertion
      role="listitem" // Assuming RecipeCard would be an item in a list-like structure
      aria-label={recipe.name}
    >
      {recipe.name}
    </div>
  ),
}));

// Define sample recipe data to be used across multiple tests.
// Using partial types for brevity as only id and name are used by the mock.
const mockRecipes: Recipe[] = [
  { id: 1, name: 'Pasta Carbonara', description: 'Classic Italian pasta', ingredients: [], instructions: '', cookingTime: 30, portionCount: 2, difficulty: 'Easy', caloriesPerServing: 500 } as Recipe,
  { id: 2, name: 'Chicken Curry', description: 'Spicy chicken curry', ingredients: [], instructions: '', cookingTime: 45, portionCount: 4, difficulty: 'Medium', caloriesPerServing: 600 } as Recipe,
  { id: 3, name: 'Beef Stew', description: 'Hearty beef stew', ingredients: [], instructions: '', cookingTime: 120, portionCount: 6, difficulty: 'Hard', caloriesPerServing: 700 } as Recipe,
];

// Main test suite for the RecipeGrid component.
// This suite encompasses tests for rendering, prop handling, user interactions, and accessibility.
describe('RecipeGrid Component: Enterprise Functionality and User Experience Tests', () => {
  // Test suite for core rendering logic and prop handling.
  // Ensures the component displays correctly under various configurations and that props are passed down as expected.
  describe('Core Rendering and Prop Integrity', () => {
    // Test case: Verifies behavior when no recipes are provided.
    // Business Context: Important for initial states, empty search results, or when data is unavailable.
    // The UI should remain stable and not crash, presenting an empty state gracefully.
    it('should render an empty container when no recipes are provided, maintaining UI consistency', () => {
      render(<RecipeGrid recipes={[]} onSelect={() => {}} />);
      // The main grid container should always be present, identified by its class.
      const gridElement = document.querySelector('.recipe-grid');
      expect(gridElement).toBeInTheDocument();
      // No recipe cards (mocked) should be rendered if the recipes array is empty.
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    // Test case: Verifies rendering with a list of recipes.
    // Business Context: Standard operational scenario where recipes are available.
    // Ensures all provided recipes are displayed and correctly mapped to child components.
    it('should render a card for each recipe when recipes are provided', () => {
      render(<RecipeGrid recipes={mockRecipes} onSelect={() => {}} />);
      // All mocked recipe cards should be rendered.
      const recipeCards = screen.getAllByRole('listitem');
      expect(recipeCards).toHaveLength(mockRecipes.length);
      // Verify that each card displays the correct recipe name (as per our mock's implementation).
      mockRecipes.forEach(recipe => {
        expect(screen.getByText(recipe.name)).toBeInTheDocument();
        expect(screen.getByLabelText(recipe.name)).toBeInTheDocument(); // Check ARIA label from mock
      });
    });

    // Test case: Validates the 'compact' prop's effect on styling and its propagation to child components.
    // Business Context: Ensures different display modes (e.g., dense vs. spacious lists for different screen sizes or user preferences) work as intended.
    it('should apply compact styling and pass compact prop correctly to children when compact is true', () => {
      render(<RecipeGrid recipes={[mockRecipes[0]]} onSelect={() => {}} compact={true} />);
      const gridElement = document.querySelector('.recipe-grid');
      // Check for the 'compact' class on the grid container.
      expect(gridElement).toHaveClass('compact');
      // Check that the RecipeCard mock received compact={true} (via data-compact attribute).
      const recipeCard = screen.getByRole('listitem', { name: mockRecipes[0].name });
      expect(recipeCard).toHaveAttribute('data-compact', 'true');
    });

    // Test case: Validates default (non-compact) styling when 'compact' is explicitly false.
    // Business Context: Ensures the standard display mode is correctly applied.
    it('should apply default (non-compact) styling when compact is false', () => {
      render(<RecipeGrid recipes={[mockRecipes[0]]} onSelect={() => {}} compact={false} />);
      const gridElement = document.querySelector('.recipe-grid');
      // Ensure 'compact' class is not present on the grid container.
      expect(gridElement).not.toHaveClass('compact');
      // Check that the RecipeCard mock received compact={false}.
      const recipeCard = screen.getByRole('listitem', { name: mockRecipes[0].name });
      expect(recipeCard).toHaveAttribute('data-compact', 'false');
    });
    
    // Test case: Validates default (non-compact) styling when 'compact' prop is not provided (should default to false).
    // Business Context: Confirms the component's default behavior aligns with design specifications if the prop is omitted.
    it('should apply default (non-compact) styling when compact prop is not provided', () => {
      render(<RecipeGrid recipes={[mockRecipes[0]]} onSelect={() => {}} />);
      const gridElement = document.querySelector('.recipe-grid');
      expect(gridElement).not.toHaveClass('compact');
      const recipeCard = screen.getByRole('listitem', { name: mockRecipes[0].name });
      // The mock RecipeCard receives compact={false} by default from RecipeGrid.
      expect(recipeCard).toHaveAttribute('data-compact', 'false');
    });

    // Test case: Validates the 'columns' prop's effect on styling.
    // Business Context: Ensures responsive or configurable layout options (e.g., number of columns in the grid) function correctly.
    it('should apply specified column styling class when columns prop is provided', () => {
      const testColumns = 3;
      render(<RecipeGrid recipes={mockRecipes} onSelect={() => {}} columns={testColumns} />);
      const gridElement = document.querySelector('.recipe-grid');
      // Check for the 'columns-X' class, indicating the number of columns.
      expect(gridElement).toHaveClass(`columns-${testColumns}`);
    });

    // Test case: Validates default column styling when 'columns' prop is not provided.
    // Business Context: Ensures a sensible default layout (e.g., 4 columns) is used if not explicitly configured.
    it('should apply default column styling (columns-4) when columns prop is not provided', () => {
      render(<RecipeGrid recipes={mockRecipes} onSelect={() => {}} />);
      const gridElement = document.querySelector('.recipe-grid');
      // Check for the default 'columns-4' class.
      expect(gridElement).toHaveClass('columns-4'); // Default is 4 as per component props
    });
  });

  // Test suite for user interactions and event handling.
  // Focuses on how the component responds to user actions, particularly the selection of a recipe.
  describe('User Interaction and Event Handling Fidelity', () => {
    // Test case: Verifies the onSelect callback functionality when a recipe card is clicked.
    // Business Context: Critical for navigation, detail view loading, or selection features.
    // Ensures the correct data (the selected recipe) is passed upwards when a user interacts with a recipe item.
    it('should trigger onSelect callback with the correct recipe when a recipe card is clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn(); // Mock function to spy on the onSelect callback.
      const selectedRecipe = mockRecipes[1]; // Choose a specific recipe for this test.

      render(<RecipeGrid recipes={mockRecipes} onSelect={handleSelect} />);
      
      // Find the specific recipe card mock by its ARIA label (name).
      const recipeCardToClick = screen.getByRole('listitem', { name: selectedRecipe.name });
      // Simulate a user click on the recipe card.
      await user.click(recipeCardToClick);

      // Verify that onSelect was called exactly once.
      expect(handleSelect).toHaveBeenCalledTimes(1);
      // Verify that onSelect was called with the correct recipe object.
      expect(handleSelect).toHaveBeenCalledWith(selectedRecipe);
    });
  });
  
  // Test suite for accessibility considerations.
  // Ensures the component is structured semantically and is usable by people with disabilities.
  // Note: For a layout component like RecipeGrid, a11y often pertains to its children (RecipeCard)
  // and the overall page structure. Here, we ensure the grid itself is a basic, understandable container
  // and that its interactive children (mocked) are reachable.
  describe('Accessibility and Semantic Structure', () => {
    // Test case: Verifies the grid container is present and structured.
    // Business Context: Ensures the component renders a basic container that can be part of an accessible page structure.
    // The RecipeGrid's role is primarily layout, but its children should be identifiable.
    it('should render a main grid container element for recipe cards', () => {
      render(<RecipeGrid recipes={mockRecipes} onSelect={() => {}} />);
      // The main div with class 'recipe-grid' should be present.
      const gridElement = document.querySelector('.recipe-grid');
      expect(gridElement).toBeInTheDocument();
      // If this were a true ARIA grid or list, we'd test for `role="grid"` or `role="list"`.
      // For now, its role is implicitly a container of items. The mocked children have `role="listitem"`.
      // This implies the parent might be considered a `list`.
    });

    // Test case: Verifies that recipe cards (mocked) are interactive and potentially focusable.
    // Business Context: Ensures interactive elements within the grid are accessible, e.g., via keyboard.
    // This test relies on the mock RecipeCard being clickable and having an appropriate role/label.
    it('should ensure recipe cards (mocked) are interactive and identifiable by assistive technologies', async () => {
        const user = userEvent.setup();
        const handleSelect = vi.fn();
        render(<RecipeGrid recipes={[mockRecipes[0]]} onSelect={handleSelect} />);
        
        // Find the card by its role and accessible name.
        const recipeCard = screen.getByRole('listitem', { name: mockRecipes[0].name });
        
        // Check if the element is in the document (already implied by getByRole).
        expect(recipeCard).toBeInTheDocument();

        // Simulate click to ensure interaction path is working.
        await user.click(recipeCard);
        expect(handleSelect).toHaveBeenCalledTimes(1);
        expect(handleSelect).toHaveBeenCalledWith(mockRecipes[0]);

        // Note: Actual focusability (e.g., for keyboard navigation) depends on the real RecipeCard's implementation
        // (e.g., if it's a <button> or has tabIndex). Our mock is a div, which isn't focusable by default.
        // However, by giving it a role and label, we test that it's structured for a11y.
    });
  });

  // Note on Test Coverage and Strategy:
  // - This test suite focuses on the RecipeGrid component's direct responsibilities:
  //   - Rendering based on the `recipes` prop.
  //   - Applying CSS classes based on `compact` and `columns` props.
  //   - Correctly passing `recipe`, `compact`, and `onSelect` (transformed) props to child `RecipeCard` components.
  //   - Ensuring the `onSelect` callback is invoked with the correct `Recipe` object upon user interaction with a child.
  // - The `RecipeCard` component is mocked. This is a common strategy for unit/integration tests of a parent component,
  //   allowing tests to be independent of the child's internal implementation. This means that the internal rendering details,
  //   specific accessibility features (beyond what's mocked), or complex logic within `RecipeCard` are not tested here.
  //   Those would be covered in `RecipeCard.test.tsx`.
  // - Error handling for invalid prop types (e.g., `recipes` not being an array) is generally covered by TypeScript at
  //   compile time. Runtime prop validation tests could be added if the component is intended for use in JavaScript environments
  //   or if there are complex inter-prop dependencies that TypeScript cannot easily catch.
  // - Edge cases like extremely large numbers of recipes or unusual recipe data are not explicitly tested but the current
  //   tests cover the fundamental mapping and rendering logic.
});
