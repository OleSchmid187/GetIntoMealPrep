import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import MyRecipes from './MyRecipes';
import { useLikedRecipes } from './useLikedRecipes';
import { Recipe, Difficulty } from '../../types/recipe'; // Updated import
// Import mocks for child components
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'; // This will be the mock
import { Paginator } from 'primereact/paginator'; // This will be the mock

// Constants from the component
const RECIPES_PER_PAGE = 8;
const RECIPE_GRID_COLUMNS = 4;

// Mock the custom hook useLikedRecipes
vi.mock('./useLikedRecipes', () => ({
  useLikedRecipes: vi.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the RecipeGrid component
// This allows us to check props passed to RecipeGrid and simulate its onSelect callback
vi.mock('../../components/RecipeGrid/RecipeGrid', () => ({
  default: vi.fn(({ recipes, onSelect, columns }) => (
    <div data-testid="mock-recipe-grid">
      <span data-testid="recipe-grid-columns">{columns}</span>
      {recipes.map((recipe: Recipe) => (
        <button key={recipe.id} onClick={() => onSelect(recipe)}>
          {recipe.name}
        </button>
      ))}
    </div>
  )),
}));

// Mock the Paginator component from primereact
// This allows us to check props passed to Paginator and simulate its onPageChange callback
vi.mock('primereact/paginator', () => ({
  Paginator: vi.fn(({ first, rows, totalRecords, onPageChange }) => (
    <div data-testid="mock-paginator">
      <span data-testid="paginator-first">{first}</span>
      <span data-testid="paginator-rows">{rows}</span>
      <span data-testid="paginator-total-records">{totalRecords}</span>
      {/* Button to simulate a page change event */}
      <button
        data-testid="paginator-onpagechange-trigger"
        onClick={() => onPageChange({ first: first + rows, rows, page: (first / rows) + 1, pageCount: Math.ceil(totalRecords / rows) })}
      >
        Simulate Page Change
      </button>
    </div>
  )),
}));

// Cast the mocked hook to Vitest's Mock type for type safety with mockReturnValue etc.
const mockUseLikedRecipes = useLikedRecipes as Mock;

describe('MyRecipes Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure test isolation
    vi.clearAllMocks();

    // Default mock implementation for useLikedRecipes for a clean state
    mockUseLikedRecipes.mockReturnValue({
      recipes: [],
      loading: false,
      error: null,
      total: 0,
    });
  });

  // Test suite for initial rendering and different states (loading, error, no data)
  describe('Initial Rendering and States', () => {
    it('should display the main header "Dein Rezeptbuch"', () => {
      // Test Purpose: Verifies that the primary header of the page is rendered correctly.
      // Business Context: The header is important for user orientation and branding.
      render(<MyRecipes />);
      expect(screen.getByRole('heading', { name: /Dein Rezeptbuch/i })).toBeInTheDocument();
    });

    it('should display loading message when recipes are being fetched', () => {
      // Test Purpose: Ensures a loading indicator is shown while data is being fetched.
      // Business Context: Provides feedback to the user that the application is working.
      mockUseLikedRecipes.mockReturnValue({
        recipes: [],
        loading: true,
        error: null,
        total: 0,
      });
      render(<MyRecipes />);
      expect(screen.getByText('Rezepte werden geladen...')).toBeInTheDocument();
    });

    it('should display error message when fetching recipes fails', () => {
      // Test Purpose: Verifies that an error message is displayed if data fetching fails.
      // Business Context: Informs the user about issues, improving error handling transparency.
      const errorMessage = 'Network Error';
      mockUseLikedRecipes.mockReturnValue({
        recipes: [],
        loading: false,
        error: errorMessage,
        total: 0,
      });
      render(<MyRecipes />);
      expect(screen.getByText(`Fehler beim Laden der Rezepte: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should display "no recipes" message when there are no recipes and not loading or error', () => {
      // Test Purpose: Checks if the "no recipes" message is shown when the list is empty.
      // Business Context: Manages user expectation when their recipe book is empty.
      mockUseLikedRecipes.mockReturnValue({
        recipes: [],
        loading: false,
        error: null,
        total: 0,
      });
      render(<MyRecipes />);
      expect(screen.getByText('Noch keine Rezepte im Rezeptbuch.')).toBeInTheDocument();
    });
  });

  // Test suite for recipe display and interactions with the RecipeGrid
  describe('Recipe Display and Interaction', () => {
    const sampleRecipes: Recipe[] = [
      { id: 1, name: 'Pasta Carbonara', imageUrl: 'pasta.jpg', instructions: "Cook pasta. Mix eggs and cheese. Combine.", portionCount: 2, difficulty: Difficulty.Easy, caloriesPerServing: 500 },
      { id: 2, name: 'Chicken Salad', imageUrl: 'salad.jpg', instructions: "Grill chicken. Chop veggies. Mix with dressing.", portionCount: 1, difficulty: Difficulty.Medium, caloriesPerServing: 350 },
    ];

    it('should render RecipeGrid with recipes when data is available', () => {
      // Test Purpose: Ensures RecipeGrid is rendered when recipes are successfully fetched.
      // Business Context: Core functionality for displaying user's liked recipes.
      mockUseLikedRecipes.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
        total: sampleRecipes.length,
      });
      render(<MyRecipes />);
      expect(screen.getByTestId('mock-recipe-grid')).toBeInTheDocument();
      // Verify that RecipeGrid mock received the correct recipes
      expect(RecipeGrid).toHaveBeenCalledWith(
        expect.objectContaining({ recipes: sampleRecipes }),
        undefined // Changed from expect.anything()
      );
      // Check if recipe names are rendered by the mock (simulating recipe items)
      expect(screen.getByText(sampleRecipes[0].name)).toBeInTheDocument();
      expect(screen.getByText(sampleRecipes[1].name)).toBeInTheDocument();
    });

    it('should pass correct props (recipes, onSelect, columns) to RecipeGrid', () => {
      // Test Purpose: Verifies that RecipeGrid receives all necessary props correctly.
      // Business Context: Ensures integration with RecipeGrid component is accurate.
      mockUseLikedRecipes.mockReturnValue({
        recipes: sampleRecipes,
        loading: false,
        error: null,
        total: sampleRecipes.length,
      });
      render(<MyRecipes />);
      
      // Check that RecipeGrid was called with the correct props
      expect(RecipeGrid).toHaveBeenCalledWith(
        expect.objectContaining({
          recipes: sampleRecipes,
          onSelect: expect.any(Function), // onSelect is a function passed down
          columns: RECIPE_GRID_COLUMNS,   // Verify the hardcoded column count
        }),
        undefined // Changed from expect.anything()
      );
      expect(screen.getByTestId('recipe-grid-columns')).toHaveTextContent(RECIPE_GRID_COLUMNS.toString());
    });

    it('should navigate to recipe details page when a recipe is selected from RecipeGrid', async () => {
      // Test Purpose: Tests navigation functionality when a user selects a recipe.
      // Business Context: Critical user flow for accessing recipe details.
      mockUseLikedRecipes.mockReturnValue({
        recipes: [sampleRecipes[0]],
        loading: false,
        error: null,
        total: 1,
      });
      render(<MyRecipes />);
      
      // Simulate user clicking on the first recipe in the mocked RecipeGrid
      const recipeButton = screen.getByText(sampleRecipes[0].name);
      await userEvent.click(recipeButton);
      
      // Verify that navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${sampleRecipes[0].id}`);
    });
  });

  // Test suite for pagination functionality
  describe('Pagination Functionality', () => {
    const manyRecipes: Recipe[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Recipe ${i + 1}`,
      imageUrl: `img${i+1}.jpg`,
      instructions: `Instructions for recipe ${i + 1}`,
      portionCount: (i % 3) + 1, // e.g. 1, 2, 3, 1, 2...
      difficulty: Object.values(Difficulty)[i % Object.values(Difficulty).length] as Difficulty, // Cycle through difficulties
      caloriesPerServing: 200 + (i * 10),
    }));

    it('should render Paginator with correct initial props', () => {
      // Test Purpose: Verifies that Paginator is rendered with correct initial settings.
      // Business Context: Ensures pagination controls are set up correctly from the start.
      const totalRecords = manyRecipes.length;
      mockUseLikedRecipes.mockReturnValue({
        recipes: manyRecipes.slice(0, RECIPES_PER_PAGE), // First page of recipes
        loading: false,
        error: null,
        total: totalRecords,
      });
      render(<MyRecipes />);
      
      expect(screen.getByTestId('mock-paginator')).toBeInTheDocument();
      // Verify Paginator mock received correct initial props
      expect(Paginator).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 0, // Initial 'first' should be 0
          rows: RECIPES_PER_PAGE, // recipesPerPage
          totalRecords: totalRecords,
          onPageChange: expect.any(Function),
        }),
        undefined // Changed from expect.anything()
      );
      expect(screen.getByTestId('paginator-first')).toHaveTextContent('0');
      expect(screen.getByTestId('paginator-rows')).toHaveTextContent(RECIPES_PER_PAGE.toString());
      expect(screen.getByTestId('paginator-total-records')).toHaveTextContent(totalRecords.toString());
    });

    it('should update displayed recipes and Paginator props when page changes', async () => {
      // Test Purpose: Tests if changing page updates data and Paginator state.
      // Business Context: Core pagination logic for browsing through many recipes.
      const totalRecords = manyRecipes.length;
      // Initial call for page 1
      mockUseLikedRecipes.mockReturnValueOnce({
        recipes: manyRecipes.slice(0, RECIPES_PER_PAGE),
        loading: false,
        error: null,
        total: totalRecords,
      });
      // Subsequent call for page 2
      mockUseLikedRecipes.mockReturnValueOnce({
        recipes: manyRecipes.slice(RECIPES_PER_PAGE, RECIPES_PER_PAGE * 2),
        loading: false,
        error: null,
        total: totalRecords,
      });

      render(<MyRecipes />);

      // Verify initial call to useLikedRecipes
      expect(mockUseLikedRecipes).toHaveBeenCalledWith(0, RECIPES_PER_PAGE);
      expect(Paginator).toHaveBeenLastCalledWith(expect.objectContaining({ first: 0, totalRecords }), undefined); // Changed from expect.anything()

      // Simulate page change using the Paginator mock's trigger
      const pageChangeTrigger = screen.getByTestId('paginator-onpagechange-trigger');
      await userEvent.click(pageChangeTrigger);

      // After page change, setFirst should be called, triggering a re-render
      // and a new call to useLikedRecipes with updated 'first'
      await waitFor(() => {
        expect(mockUseLikedRecipes).toHaveBeenCalledTimes(2); // Initial + after page change
        expect(mockUseLikedRecipes).toHaveBeenCalledWith(RECIPES_PER_PAGE, RECIPES_PER_PAGE);
      });
      
      // Paginator should re-render with the new 'first' value
      await waitFor(() => {
        expect(Paginator).toHaveBeenLastCalledWith(
            expect.objectContaining({ first: RECIPES_PER_PAGE, totalRecords }),
            undefined // Changed from expect.anything()
        );
        // This assertion relies on the mock Paginator updating its display based on new props
        expect(screen.getByTestId('paginator-first')).toHaveTextContent(RECIPES_PER_PAGE.toString());
      });
    });

    it('should call useLikedRecipes with correct parameters on initial load', () => {
        // Test Purpose: Verifies that the useLikedRecipes hook is called with the correct initial pagination parameters.
        // Business Context: Ensures data fetching starts with the correct offset and limit.
        render(<MyRecipes />);
        expect(mockUseLikedRecipes).toHaveBeenCalledWith(0, RECIPES_PER_PAGE);
    });
  });

  // Note on coverage: This test suite aims to cover all primary logic paths:
  // - Rendering under different data states (loading, error, empty, populated).
  // - Correct prop delegation to child components (RecipeGrid, Paginator).
  // - User interactions (recipe selection leading to navigation, page changes).
  // - State updates related to pagination.
  // The internal logic of `useLikedRecipes`, `RecipeGrid`, and `Paginator` is not tested here,
  // as they are mocked; they should have their own dedicated tests.
});
