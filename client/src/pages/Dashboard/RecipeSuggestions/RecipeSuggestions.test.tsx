import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeSuggestions from './RecipeSuggestions.tsx';
import { Recipe, Difficulty } from '../../../types/recipe';

// --- Mocking Setup ---

// 1. Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock the './useRecipeSuggestions.ts' module.
// The factory now directly returns vi.fn(). This instance will be what's imported.
vi.mock('./useRecipeSuggestions.ts', () => ({
  useRecipeSuggestions: vi.fn(),
}));

// 3. Import the mocked hook.
// At this point, 'useRecipeSuggestions' refers to the vi.fn() returned by the factory above.
// We also import the original hook's type signature for casting.
// Note: Due to mocking, importing OriginalUseRecipeSuggestionsType might also point to the mock,
// but it's typically sufficient for typeof in vi.MockedFunction.
import { useRecipeSuggestions } from "./useRecipeSuggestions.ts";
// To get the original type more reliably if needed, you might need a separate type definition
// or ensure the original module exports its type explicitly if it's complex.
// For this case, typeof useRecipeSuggestions (which is the mock) should work for casting.
import type { useRecipeSuggestions as OriginalUseRecipeSuggestionsSignature } from "./useRecipeSuggestions.ts";

// 4. Create a correctly typed alias for the mock function for use in tests.
const mockUseRecipeSuggestions = useRecipeSuggestions as vi.MockedFunction<typeof OriginalUseRecipeSuggestionsSignature>;

// 5. Mock the RecipeGrid component
// The factory now directly returns vi.fn(). This instance will be what's imported.
vi.mock('../../../components/RecipeGrid/RecipeGrid.tsx', () => ({
  default: vi.fn(),
}));

// 6. Import the mocked RecipeGrid component and its original type for casting.
import RecipeGrid from "../../../components/RecipeGrid/RecipeGrid.tsx";
import type OriginalRecipeGridType from "../../../components/RecipeGrid/RecipeGrid.tsx"; // Assuming default export

// 7. Create a correctly typed alias for the RecipeGrid mock.
const MockRecipeGrid = RecipeGrid as vi.MockedFunction<typeof OriginalRecipeGridType>;

// --- End Mocking Setup ---

// Sample recipe data for testing
const sampleRecipes: Recipe[] = [
  { 
    id: 1, 
    name: 'Spaghetti Carbonara', 
    imageUrl: 'spaghetti.jpg', 
    portionCount: 2, 
    caloriesPerServing: 600, 
    difficulty: Difficulty.Medium, 
    instructions: 'Cook pasta...', 
  },
  { 
    id: 2, 
    name: 'Chicken Salad', 
    imageUrl: 'chickensalad.jpg', 
    portionCount: 1, 
    caloriesPerServing: 400, 
    difficulty: Difficulty.Easy, 
    instructions: 'Mix ingredients...',
  },
];

describe('RecipeSuggestions Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    mockNavigate.mockClear();
    // Use the typed mock for interactions
    mockUseRecipeSuggestions.mockClear();
    MockRecipeGrid.mockClear();

    // Default implementation for MockRecipeGrid to allow interaction
    MockRecipeGrid.mockImplementation(
      ({
        recipes,
        onSelect,
        columns,
      }: {
        recipes: Recipe[]; // Type for recipes
        onSelect: (recipe: Recipe) => void; // Type for onSelect
        columns: number;
      }) => (
        <div data-testid="mock-recipe-grid">
          {recipes.map((recipe: Recipe) => ( // Ensure recipe is typed here as well
            <button
              key={recipe.id}
              onClick={() => onSelect(recipe)}
              data-testid={`recipe-item-${recipe.id}`}
              aria-label={`Select recipe ${recipe.name}`}
            >
              {recipe.name}
            </button>
          ))}
          <span data-testid="recipe-grid-columns-prop" style={{ display: 'none' }}>
            {columns}
          </span>
        </div>
      )
    );
  });

  // Test suite for different rendering states based on the hook's output
  describe('Rendering based on useRecipeSuggestions state', () => {
    // Test case: Component displays a loading message.
    // This verifies that users are informed when data is being fetched.
    it('should display the loading message "Lade Rezepte..." when data is being fetched', () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: [],
        loading: true,
        error: null,
      });
      render(<RecipeSuggestions />);
      // Expect the German loading text to be present
      expect(screen.getByText('Lade Rezepte...')).toBeInTheDocument();
    });

    // Test case: Component displays an error message.
    // This ensures that users are notified if data fetching fails.
    it('should display the provided error message when fetching recipes fails', () => {
      const errorMessage = 'Network Error: Failed to fetch recipes.';
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: [],
        loading: false,
        error: errorMessage,
      });
      render(<RecipeSuggestions />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Test case: Component renders successfully with recipe data.
    // This verifies the primary success scenario: recipes are loaded and displayed.
    it('should render the section title, recipe grid, and "Discover More Recipes" button when recipes are loaded successfully', () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
      });
      render(<RecipeSuggestions />);

      // Expect the German section title
      expect(screen.getByText('Probier doch mal folgende Rezepte:')).toBeInTheDocument();
      // Expect the mocked RecipeGrid to be called and rendered
      expect(screen.getByTestId('mock-recipe-grid')).toBeInTheDocument();
      // Expect recipe items from the mock to be rendered
      expect(screen.getByText(sampleRecipes[0].name)).toBeInTheDocument();
      expect(screen.getByText(sampleRecipes[1].name)).toBeInTheDocument();
      // Expect the German button text
      expect(screen.getByRole('button', { name: /Mehr Rezepte entdecken/i })).toBeInTheDocument();
    });

    // Test case: Component renders correctly when the recipe list is empty.
    // This ensures the UI remains consistent and functional even with no recipes to suggest.
    it('should render correctly with the title and button when the recipes list is empty after loading', () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: [],
        loading: false,
        error: null,
      });
      render(<RecipeSuggestions />);
      expect(screen.getByText('Probier doch mal folgende Rezepte:')).toBeInTheDocument();
      expect(screen.getByTestId('mock-recipe-grid')).toBeInTheDocument();
      // Ensure no recipe items are rendered (our mock renders buttons with specific aria-labels)
      expect(screen.queryAllByRole('button', { name: /^Select recipe/ })).toHaveLength(0);
      expect(screen.getByRole('button', { name: /Mehr Rezepte entdecken/i })).toBeInTheDocument();
    });
  });

  // Test suite for user interactions and navigation behavior
  describe('User Interactions and Navigation', () => {
    const user = userEvent.setup();

    // Test case: Navigation to recipe details page.
    // This verifies that clicking a recipe in the grid triggers navigation to the correct URL.
    it('should navigate to the correct recipe detail page when a recipe in the grid is clicked', async () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
      });
      render(<RecipeSuggestions />);

      const firstRecipeButton = screen.getByTestId(`recipe-item-${sampleRecipes[0].id}`);
      await user.click(firstRecipeButton);

      // Verify navigate was called with the path for the selected recipe
      expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${sampleRecipes[0].id}`);
    });

    // Test case: Navigation to the all recipes page.
    // This verifies that clicking the "Discover More Recipes" button navigates to the main recipes page.
    it('should navigate to the "/recipes" page when the "Mehr Rezepte entdecken" button is clicked', async () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
      });
      render(<RecipeSuggestions />);

      const discoverMoreButton = screen.getByRole('button', { name: /Mehr Rezepte entdecken/i });
      await user.click(discoverMoreButton);

      // Verify navigate was called with the "/recipes" path
      expect(mockNavigate).toHaveBeenCalledWith('/recipes');
    });
  });

  // Test suite for verifying props passed to child components
  describe('Prop passing to child components', () => {
    // Test case: Correct 'columns' prop for RecipeGrid.
    // The component is hardcoded to fetch 3 suggestions, which should translate to 3 columns.
    // This test ensures that RecipeGrid receives the expected 'columns' prop.
    it('should pass the correct number of columns (3) to RecipeGrid', () => {
      mockUseRecipeSuggestions.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
      });
      render(<RecipeSuggestions />);

      // The useRecipeSuggestions hook is called with 3 in the component.
      // This should result in columns={3} being passed to RecipeGrid.
      // The second argument to a functional component mock (context/ref) is undefined if not used.
      expect(MockRecipeGrid).toHaveBeenCalledWith(
        expect.objectContaining({
          columns: 3,
        }),
        undefined // Expect undefined for the second argument
      );
      
      // Additionally, check the rendered output from our mock if it exposes this prop
      const columnsSpan = screen.getByTestId('recipe-grid-columns-prop');
      expect(columnsSpan).toHaveTextContent('3');
    });

    // Test case: Correct arguments for useRecipeSuggestions hook.
    // This verifies that the hook is called with the expected count of recipes.
    it('should call useRecipeSuggestions with a count of 3', () => {
        mockUseRecipeSuggestions.mockReturnValue({
            recipes: [],
            loading: true,
            error: null,
        });
        render(<RecipeSuggestions />);
        // Verifies that the hook responsible for fetching recipe suggestions
        // is invoked with the predefined count of 3. This is important for
        // ensuring the component requests the correct amount of data.
        expect(mockUseRecipeSuggestions).toHaveBeenCalledWith(3);
    });
  });

  // Note on coverage:
  // This test suite covers the primary logic paths of the RecipeSuggestions component:
  // - Loading, error, and success states (including empty data).
  // - Navigation interactions for both recipe selection and the "discover more" button.
  // - Correct prop passing to the RecipeGrid child component.
  // - Correct invocation of the useRecipeSuggestions hook.
  // The component itself is relatively simple, mainly orchestrating data fetching and navigation.
  // All significant branches and interactions should be covered.
});
