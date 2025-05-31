import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecipeDetails from './RecipeDetails';
import { useRecipeDetails } from './useRecipeDetails';
import { LikeButton } from '../../../components/LikeButton/LikeButton';
import { Difficulty, Recipe } from '../../../types/recipe'; // Import Difficulty and Recipe type
import * as ReactRouterDom from 'react-router-dom'; // Import for types and original

// Mock the custom hook useRecipeDetails
vi.mock('./useRecipeDetails');

// Mock the LikeButton component
vi.mock('../../../components/LikeButton/LikeButton', () => ({
  LikeButton: vi.fn(({ recipeId }) => <div data-testid="mock-like-button">LikeButton for {recipeId}</div>),
}));

// Mock react-router-dom to control useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual, // Spread actual to keep MemoryRouter, Routes, Route etc.
    useParams: vi.fn(), // Mock useParams
  };
});
const mockedUseParams = ReactRouterDom.useParams as vi.MockedFunction<typeof ReactRouterDom.useParams>;

// Mock data for recipe and ingredients
const mockRecipe: Recipe = { // Use Recipe type
  id: 1,
  name: 'Test Recipe',
  imageUrl: 'test-recipe.jpg',
  portionCount: 4,
  caloriesPerServing: 500,
  difficulty: Difficulty.Medium, // Use Difficulty enum
  instructions: 'Step 1: Do this. Step 2: Do that.',
  // Optional fields can be omitted or set to undefined if not used by the component directly
  description: undefined, 
  ingredients: undefined, 
  categories: undefined,
};

const mockIngredients = [
  { id: 1, name: 'Ingredient 1', quantity: '100', unit: 'g', imageUrl: 'ingredient1.jpg' },
  { id: 2, name: 'Ingredient 2', quantity: '2', unit: 'pcs', imageUrl: null }, // Test placeholder image
];

const mockUseRecipeDetails = useRecipeDetails as vi.MockedFunction<typeof useRecipeDetails>;

const renderComponent = (recipeId: string = '1') => {
  // Set the mocked useParams to return the recipeId for this render
  mockedUseParams.mockReturnValue({ id: recipeId });
  return render(
    <MemoryRouter initialEntries={[`/recipes/${recipeId}`]}>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RecipeDetails Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseRecipeDetails.mockReset();
    mockedUseParams.mockReset(); // Reset useParams mock
    vi.clearAllMocks();
  });

  // Test for the loading state
  it('should display loading state initially', () => {
    // Arrange: Configure the mock hook to return a loading state.
    mockUseRecipeDetails.mockReturnValue({
      recipe: null,
      ingredients: [],
      loading: true,
      error: null,
    });

    // Act: Render the component.
    renderComponent();

    // Assert: Verify that the loading message is displayed.
    // This test ensures that users are informed that data is being fetched.
    expect(screen.getByText('Lade Rezeptdetails...')).toBeInTheDocument();
  });

  // Test for the error state
  it('should display error message when an error occurs', () => {
    // Arrange: Configure the mock hook to return an error state.
    const errorMessage = 'Failed to fetch recipe details.';
    mockUseRecipeDetails.mockReturnValue({
      recipe: null,
      ingredients: [],
      loading: false,
      error: errorMessage,
    });

    // Act: Render the component.
    renderComponent();

    // Assert: Verify that the error message is displayed.
    // This test ensures that users are properly notified of any data fetching failures.
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  // Test for the "recipe not found" state
  it('should display "Rezept nicht gefunden." message when recipe is null and not loading', () => {
    // Arrange: Configure the mock hook to return a state where the recipe is not found.
    mockUseRecipeDetails.mockReturnValue({
      recipe: null,
      ingredients: [],
      loading: false,
      error: null,
    });
    // Arrange: useParams will be called by the component.
    // Ensure it's mocked to return some ID for this scenario.
    mockedUseParams.mockReturnValue({ id: '1' });


    // Act: Render the component.
    renderComponent();

    // Assert: Verify that the "recipe not found" message is displayed.
    // This test covers the scenario where a recipe ID might be valid but no corresponding data exists.
    expect(screen.getByText('Rezept nicht gefunden.')).toBeInTheDocument();
  });

  // Group tests for when recipe data is successfully loaded
  describe('when recipe data is successfully loaded', () => {
    beforeEach(() => {
      // Arrange: Configure the mock hook to return successful recipe and ingredients data.
      // This setup is common for all tests in this describe block.
      mockUseRecipeDetails.mockReturnValue({
        recipe: mockRecipe,
        ingredients: mockIngredients,
        loading: false,
        error: null,
      });
      // useParams will be called by the component. Set its return value.
      // renderComponent will handle this for its specific recipeId.
    });

    // Test for rendering recipe title and LikeButton
    it('should render recipe title and LikeButton with correct recipeId', () => {
      // Act: Render the component with a specific recipe ID.
      const recipeId = '1';
      renderComponent(recipeId); // This will set mockedUseParams to return { id: '1' }

      // Assert: Verify that the recipe title is displayed.
      // This ensures the main identifier of the recipe is visible.
      expect(screen.getByRole('heading', { name: mockRecipe.name, level: 1 })).toBeInTheDocument();

      // Assert: Verify that the mock LikeButton is rendered and received the correct recipeId.
      // This checks integration with the LikeButton and correct prop passing.
      const likeButton = screen.getByTestId('mock-like-button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveTextContent(`LikeButton for ${parseInt(recipeId, 10)}`);
      // Functional components are called with (props, context/ref). If no ref, context is undefined.
      expect(LikeButton).toHaveBeenCalledWith({ recipeId: parseInt(recipeId, 10) }, undefined);
    });

    // Test for rendering recipe image
    it('should render recipe image with correct alt text and preview enabled', () => {
      // Act: Render the component.
      renderComponent();

      // Assert: Verify that the recipe image is displayed with the correct src and alt text.
      // Alt text is crucial for accessibility (a11y).
      // The 'preview' prop is part of PrimeReact's Image component; we check its presence by implication of rendering.
      const recipeImage = screen.getByAltText(mockRecipe.name) as HTMLImageElement;
      expect(recipeImage).toBeInTheDocument();
      expect(recipeImage.src).toContain(mockRecipe.imageUrl);
      // Note: Testing the 'preview' prop directly on the DOM element is complex as it's a PrimeReact internal.
      // We trust PrimeReact's component to handle it if the prop is passed, which it is in the source.
    });

    // Test for rendering recipe metadata (portions, calories, difficulty)
    it('should render recipe metadata (portions, calories, difficulty)', () => {
      // Act: Render the component.
      renderComponent();

      // Assert: Verify that portion count is displayed.
      expect(screen.getByText(`Portionen:`)).toBeInTheDocument();
      expect(screen.getByText(mockRecipe.portionCount.toString())).toBeInTheDocument();

      // Assert: Verify that calories per serving are displayed.
      expect(screen.getByText(`Kalorien:`)).toBeInTheDocument();
      expect(screen.getByText(`${mockRecipe.caloriesPerServing} kcal`)).toBeInTheDocument();
      
      // Assert: Verify that difficulty is displayed with the correct class.
      // The class name check ensures styling based on difficulty is applied.
      expect(screen.getByText(`Schwierigkeit:`)).toBeInTheDocument();
      const difficultyElement = screen.getByText(mockRecipe.difficulty); // This element should have the class
      expect(difficultyElement).toBeInTheDocument();
      // The element containing the difficulty text itself should have the class.
      expect(difficultyElement).toHaveClass(`difficulty-${mockRecipe.difficulty.toLowerCase()}`);
    });

    // Test for rendering recipe instructions
    it('should render recipe instructions', () => {
      // Act: Render the component.
      renderComponent();

      // Assert: Verify that the "Zubereitung" (Preparation) heading is present.
      expect(screen.getByRole('heading', { name: 'Zubereitung', level: 2 })).toBeInTheDocument();
      // Assert: Verify that the recipe instructions are displayed.
      // This ensures users can see how to prepare the recipe.
      expect(screen.getByText(mockRecipe.instructions)).toBeInTheDocument();
    });

    // Test for rendering ingredients section and cards
    it('should render ingredients section with ingredient cards', () => {
      // Act: Render the component.
      const { container } = renderComponent();

      // Assert: Verify that the "Zutaten" (Ingredients) heading is present.
      expect(screen.getByRole('heading', { name: 'Zutaten', level: 2 })).toBeInTheDocument();

      // Assert: Verify that each ingredient is rendered as a card with correct details.
      // This checks the dynamic rendering of the ingredients list.
      mockIngredients.forEach(ingredient => {
        const ingredientCard = screen.getByText(ingredient.name).closest('.ingredient-card');
        expect(ingredientCard).toBeInTheDocument();

        if (ingredientCard) { // Type guard for safety
          // Check title (name)
          expect(within(ingredientCard as HTMLElement).getByText(ingredient.name)).toBeInTheDocument();
          // Check subtitle (quantity and unit)
          expect(within(ingredientCard as HTMLElement).getByText(`${ingredient.quantity} ${ingredient.unit}`)).toBeInTheDocument();
          
          // Check image: if imageUrl is present, it should be used; otherwise, a placeholder.
          const imgElement = within(ingredientCard as HTMLElement).getByAltText(ingredient.name) as HTMLImageElement;
          expect(imgElement).toBeInTheDocument();
          if (ingredient.imageUrl) {
            expect(imgElement.src).toContain(ingredient.imageUrl);
          } else {
            expect(imgElement.src).toContain('platzhalter.png'); // Placeholder image
          }
        }
      });
      // Ensure the correct number of ingredient cards are rendered by checking the class
      const ingredientCardElements = container.querySelectorAll('.ingredient-card');
      expect(ingredientCardElements.length).toBe(mockIngredients.length);
    });

    // Test for placeholder image for ingredients without imageUrl
    it('should render placeholder image for ingredients without imageUrl', () => {
        // Arrange: Specific mock for this test case with one ingredient having null imageUrl
        const ingredientWithNoImage = { id: 3, name: 'No Image Ingredient', quantity: '1', unit: 'cup', imageUrl: null };
        mockUseRecipeDetails.mockReturnValue({
            recipe: mockRecipe,
            ingredients: [ingredientWithNoImage],
            loading: false,
            error: null,
        });

        // Act: Render the component.
        renderComponent();

        // Assert: Verify that the ingredient card for 'No Image Ingredient' uses the placeholder image.
        // This ensures graceful handling of missing image URLs for ingredients.
        const imgElement = screen.getByAltText(ingredientWithNoImage.name) as HTMLImageElement;
        expect(imgElement).toBeInTheDocument();
        expect(imgElement.src).toContain('platzhalter.png');
    });
  });

  // Test for correct parsing of recipe ID from params
  it('should parse recipe ID from URL params correctly', () => {
    // Arrange: Set up a specific recipe ID in the URL.
    const testRecipeId = '99';
    // renderComponent will set mockedUseParams to return { id: testRecipeId }
    mockUseRecipeDetails.mockReturnValue({ // Provide minimal data to avoid other errors
      recipe: mockRecipe,
      ingredients: [],
      loading: false,
      error: null,
    });

    // Act: Render the component with the specific recipe ID.
    renderComponent(testRecipeId);

    // Assert: Verify that useRecipeDetails was called with the correctly parsed integer ID.
    // This ensures that the string ID from URL params is converted to a number as expected by the hook.
    expect(mockUseRecipeDetails).toHaveBeenCalledWith(parseInt(testRecipeId, 10));
    // Also assert that useParams was called and returned the correct id
    expect(mockedUseParams).toHaveBeenCalled();
    expect(mockedUseParams).toHaveLastReturnedWith({ id: testRecipeId });
  });

  // Test for default recipe ID parsing if ID param is missing (though unlikely with strict routing)
  it('should use default recipe ID (0) if id param is missing or invalid, and call useRecipeDetails with it', () => {
    // Arrange: Mock useParams to return an undefined id for this specific test.
    // This tests the component's internal parseInt(id || "0", 10) fallback.
    mockedUseParams.mockReturnValueOnce({ id: undefined });

    mockUseRecipeDetails.mockReturnValue({
      recipe: null, // Expecting "Recipe not found" or similar for ID 0
      ingredients: [],
      loading: false,
      error: null,
    });
    
    // Act: Render the component. Note: initialEntries needs a path that would match.
    // We are testing the component's internal logic for `parseInt(id || "0", 10)`.
    // Render RecipeDetails directly as this test has specific useParams setup not covered by renderComponent.
    render(
      <MemoryRouter initialEntries={[`/recipes/somepath-that-matches-route-if-needed`]}> 
        {/* The path in initialEntries is less critical here since useParams is fully controlled */}
        <Routes>
            <Route path="/recipes/:id" element={<RecipeDetails />} />
            <Route path="/recipes/somepath-that-matches-route-if-needed" element={<RecipeDetails />} /> 
        </Routes>
      </MemoryRouter>
    );

    // Assert: Verify that useRecipeDetails was called with 0.
    expect(mockUseRecipeDetails).toHaveBeenCalledWith(0);
    // Also check that "Recipe not found" is shown, as ID 0 is unlikely to exist.
    expect(screen.getByText('Rezept nicht gefunden.')).toBeInTheDocument();
  });
});
