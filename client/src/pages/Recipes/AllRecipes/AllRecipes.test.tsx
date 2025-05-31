import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AllRecipes from "./AllRecipes";
import { useAllRecipes } from "./useAllRecipes";
import { useNavigate } from "react-router-dom";
import { Recipe, Difficulty } from "../../../types/recipe";
import { LogtoProvider, LogtoConfig } from "@logto/react";

// Mock the custom hook useAllRecipes
vi.mock("./useAllRecipes");

// Mock react-router-dom's useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

// Minimal mock Logto config
const mockLogtoConfig: LogtoConfig = {
  appId: "test-app-id",
  endpoint: "https://test-logto-endpoint.com",
};

const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    instructions: "Cook pasta. Fry bacon. Mix eggs and cheese. Combine.",
    portionCount: 2,
    difficulty: Difficulty.Easy,
    caloriesPerServing: 600,
    imageUrl: "carbonara.jpg",
  },
  {
    id: 2,
    name: "Chicken Curry",
    instructions: "Cook chicken. Add curry paste and coconut milk. Simmer.",
    portionCount: 4,
    difficulty: Difficulty.Medium,
    caloriesPerServing: 450,
    imageUrl: "curry.jpg",
  },
];

describe("AllRecipes Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
    // Ensure useAllRecipes is reset for each test to its default mock or specific test mock
    (useAllRecipes as vi.Mock).mockReturnValue({
        recipes: [],
        loading: true,
        error: null,
        total: 0,
      });
  });

  // Test case: Component renders loading state correctly.
  // This is important to ensure users see a loading indicator while data is being fetched.
  it("should render loading state initially", () => {
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: [],
      loading: true,
      error: null,
      total: 0,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // Expect the loading message to be present in the document.
    expect(screen.getByText("Rezepte werden geladen...")).toBeInTheDocument();
    // Expect the main title to be present.
    expect(screen.getByRole('heading', { name: /Alle Rezepte/i })).toBeInTheDocument();
  });

  // Test case: Component renders error message when an error occurs during data fetching.
  // This ensures users are informed if something goes wrong.
  it("should render error message when an error occurs", () => {
    const errorMessage = "Network Error";
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: [],
      loading: false,
      error: errorMessage,
      total: 0,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // Expect the error message to be displayed.
    expect(screen.getByText(`Fehler beim Laden der Rezepte: ${errorMessage}`)).toBeInTheDocument();
  });

  // Test case: Component renders a "no recipes" message when no recipes are available and not loading/error.
  // This provides clear feedback to the user when the recipe list is empty.
  it('should render "No recipes available" message when no recipes are found', () => {
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: [],
      loading: false,
      error: null,
      total: 0,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // Expect the "no recipes" message to be present.
    expect(screen.getByText("Noch keine Rezepte verfügbar.")).toBeInTheDocument();
  });

  // Test case: Component renders the RecipeGrid with recipes when data is successfully loaded.
  // This verifies that recipes are displayed correctly.
  it("should render RecipeGrid with recipes when recipes are loaded", () => {
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      total: mockRecipes.length,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // Expect the RecipeGrid to display the recipe names.
    expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
    expect(screen.getByText("Chicken Curry")).toBeInTheDocument();
    // Check if Paginator is rendered by looking for one of its specific buttons.
    // The Paginator should display "Page 1" if there are records.
    expect(screen.getByRole('button', { name: /Page 1/i })).toBeInTheDocument();
  });

  // Test case: Paginator component is rendered with correct initial props.
  // This ensures pagination is set up correctly from the start.
  it("should render Paginator with correct props", () => {
    const totalRecords = 20; // More than 1 page
    const recipesPerPage = 8;
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: mockRecipes, // Provide some recipes so Paginator is visible
      loading: false,
      error: null,
      total: totalRecords,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // Check for the presence of the Paginator by looking for a characteristic button.
    // For example, the "Page 1" button should be present and often highlighted.
    const pageOneButton = screen.getByRole('button', { name: /Page 1/i });
    expect(pageOneButton).toBeInTheDocument();
    // PrimeReact Paginator active page button usually has 'p-highlight' class.
    expect(pageOneButton).toHaveClass('p-highlight');


    // Check if the paginator displays the first page as active by default (or the corresponding items)
    // PrimeReact Paginator uses buttons for page numbers. The active one often has 'p-highlight' class.
    // We can also check the number of items displayed if applicable.
    // For this test, we'll mainly ensure it's present and the hook is called with initial values.
    expect(useAllRecipes).toHaveBeenCalledWith(0, recipesPerPage);
  });

  // Test case: Paginator page change updates the 'first' state and re-fetches recipes.
  // This verifies the pagination interaction and its effect on data fetching.
  it("should call onPageChange and update first when Paginator page changes", async () => {
    const recipesPerPage = 8;
    const totalRecords = 16; // e.g., 2 pages
     (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: mockRecipes, // Initial load with some recipes
      loading: false,
      error: null,
      total: totalRecords,
    });

    // Mock the subsequent call to useAllRecipes after page change
    const mockUseAllRecipesSecondCall = vi.fn().mockReturnValue({
        recipes: [mockRecipes[0]], // Simulate different data for the second page
        loading: false,
        error: null,
        total: totalRecords,
    });

    (useAllRecipes as vi.Mock)
        .mockImplementationOnce(() => ({ // Initial call
            recipes: mockRecipes,
            loading: false,
            error: null,
            total: totalRecords,
        }))
        .mockImplementationOnce(mockUseAllRecipesSecondCall); // Second call after page change


    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );
    
    // The Paginator component from PrimeReact renders page numbers as buttons.
    // We need to find the button for the next page.
    // Typically, page numbers start from 1. The second page would be '2'.
    // Ensure there are enough records for page 2 to be clickable.
    // If totalRecords is 16 and recipesPerPage is 8, there will be a "Page 2" button.
    const pageTwoButton = screen.getByRole('button', { name: /page 2/i });
    expect(pageTwoButton).toBeInTheDocument();

    await userEvent.click(pageTwoButton);

    // The useAllRecipes hook should be called again with the new 'first' value.
    // For page 2, with 8 recipesPerPage, 'first' should be 8.
    expect(useAllRecipes).toHaveBeenCalledTimes(2); // Initial call + call after page change
    expect(useAllRecipes).toHaveBeenNthCalledWith(1, 0, recipesPerPage); // Initial call
    expect(useAllRecipes).toHaveBeenNthCalledWith(2, recipesPerPage, recipesPerPage); // Call after page change
    expect(mockUseAllRecipesSecondCall).toHaveBeenCalledWith(recipesPerPage, recipesPerPage);
  });

  // Test case: Navigates to recipe details page when a recipe is selected in RecipeGrid.
  // This ensures that user interaction with the recipe grid triggers the correct navigation.
  it("should navigate to recipe details page when a recipe is selected in RecipeGrid", async () => {
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: [mockRecipes[0]], // Provide one recipe for selection
      loading: false,
      error: null,
      total: 1,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );

    // RecipeGrid renders items that can be clicked. We assume RecipeGrid calls onSelect with the recipe object.
    // We need to find an element representing the recipe and click it.
    // Let's assume the recipe name is clickable or part of a clickable card.
    const recipeElement = screen.getByText(mockRecipes[0].name);
    expect(recipeElement).toBeInTheDocument();

    // Simulate click on the recipe.
    // The RecipeGrid component itself will handle the click and call the onSelect prop.
    // Here, we're testing the AllRecipes component's integration with RecipeGrid's onSelect.
    // We need to find a clickable element within the RecipeGrid for that recipe.
    // If RecipeGrid renders each recipe as a div or article, we can target that.
    // For simplicity, if the text itself is within a clickable area:
    await userEvent.click(recipeElement);

    // Expect navigate to have been called with the correct path.
    expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${mockRecipes[0].id}`);
  });

  // Test case: Ensure the main title "Alle Rezepte" is always displayed.
  // This is a basic accessibility and UI check.
  it('should display the main title "Alle Rezepte"', () => {
    (useAllRecipes as vi.Mock).mockReturnValue({
      recipes: [],
      loading: false,
      error: null,
      total: 0,
    });

    render(
      <LogtoProvider config={mockLogtoConfig}>
        <AllRecipes />
      </LogtoProvider>
    );
    expect(screen.getByRole('heading', { name: /Alle Rezepte/i, level: 2 })).toBeInTheDocument();
  });

  // Note: Testing the internal implementation of RecipeGrid or Paginator is out of scope for this component's tests.
  // We are testing the integration of AllRecipes with these components.
  // Accessibility (a11y) tests could be added, for example, checking for ARIA attributes on the paginator
  // or ensuring recipe items are keyboard navigable, but this often depends on the child components' implementation.
});
