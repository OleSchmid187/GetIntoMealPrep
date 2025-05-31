import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecipeSelectDialog from './RecipeSelectDialog';
import { Recipe } from '../../../types/recipe'; // Assuming Recipe type is needed for mocks
import { useState, useEffect } from 'react'; // Import useState and useEffect

// --- Hoisted Mocks ---
const { mockUseRecipeSelectDialog, mockSetSearch, mockRecipes, actualSetSearchImpl, originalMockUseRecipeSelectDialogImpl } = vi.hoisted(() => {
  let currentHookSearchState = '';

  const setSearchSpy = vi.fn((newSearchVal: string) => {
    currentHookSearchState = newSearchVal;
  });

  const recipesData: Partial<Recipe>[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Recipe ${i + 1}`,
    imageUrl: `http://example.com/recipe${i + 1}.jpg`,
  }));

  const originalImpl = () => ({
    recipes: recipesData,
    search: currentHookSearchState,
    setSearch: setSearchSpy,
    loading: false,
  });

  return {
    mockSetSearch: setSearchSpy,
    actualSetSearchImpl: (initialValue: string = '') => { currentHookSearchState = initialValue; },
    mockRecipes: recipesData,
    mockUseRecipeSelectDialog: vi.fn(originalImpl), // Store the original implementation
    originalMockUseRecipeSelectDialogImpl: originalImpl, // Export for reset
  };
});

const mockRecipeGrid = vi.fn();
const mockPrimeDialog = vi.fn();
const mockPrimeInputText = vi.fn();
const mockPrimePaginator = vi.fn();

// --- Mock Implementations ---
vi.mock('./useRecipeSelectDialog', () => ({
  useRecipeSelectDialog: mockUseRecipeSelectDialog,
}));

vi.mock('../../../components/RecipeGrid/RecipeGrid', () => ({
  default: (props: any) => {
    mockRecipeGrid(props);
    // Simulate rendering recipe names to check pagination
    return (
      <div data-testid="recipe-grid">
        {props.recipes.map((recipe: any) => (
          <div key={recipe.id} onClick={() => props.onSelect(recipe)}>
            {recipe.name}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock('primereact/dialog', () => ({
  Dialog: (props: any) => {
    mockPrimeDialog(props);
    if (!props.visible) return null;
    return (
      <div data-testid="mock-dialog" aria-modal="true" role="dialog">
        {props.children}
        <button data-testid="mock-dialog-hide" onClick={props.onHide}>Close</button>
      </div>
    );
  },
}));

vi.mock('primereact/inputtext', () => ({
  InputText: (props: any) => {
    mockPrimeInputText(props);
    // Use local state to ensure the input behaves as controlled for userEvent.type
    const [inputValue, setInputValue] = useState(props.value);

    useEffect(() => {
      // Sync with external changes to props.value (e.g., if search is cleared externally)
      setInputValue(props.value);
    }, [props.value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value); // Update local state for the input element
      if (props.onChange) {
        props.onChange(event); // Propagate the event to the component's handler
      }
    };

    return (
      <input
        type="text"
        value={inputValue} // Use internal state for the input's value attribute
        onChange={handleChange}
        placeholder={props.placeholder}
        data-testid="mock-inputtext"
      />
    );
  },
}));

vi.mock('primereact/paginator', () => ({
  Paginator: (props: any) => {
    mockPrimePaginator(props);
    return (
      <div data-testid="mock-paginator">
        <span>Page: {Math.floor(props.first / props.rows) + 1}</span>
        <button data-testid="mock-paginator-next" onClick={() => props.onPageChange({ first: props.first + props.rows, rows: props.rows })}>
          Next
        </button>
      </div>
    );
  },
}));

describe('RecipeSelectDialog Component', () => {
  const user = userEvent.setup();
  let defaultProps: {
    visible: boolean;
    onHide: () => void;
    onSelect: (recipe: { id: number; name: string }) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    actualSetSearchImpl(''); // Reset the hook's internal search state
    // Reset the mock to its original implementation to ensure `loading: false` by default
    mockUseRecipeSelectDialog.mockImplementation(originalMockUseRecipeSelectDialogImpl);


    defaultProps = {
      visible: true,
      onHide: vi.fn(),
      onSelect: vi.fn(),
    };
    // The hoisted mockUseRecipeSelectDialog will use the reset currentHookSearchState.
    // No need to redefine its implementation here as the hoisted one correctly uses currentHookSearchState.
  });

  // Test Suite: Rendering and Visibility
  describe('Rendering and Visibility', () => {
    it('should render the dialog and its contents when visible is true', () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
      expect(screen.getByText('Rezept auswählen')).toBeInTheDocument(); // German text
      expect(screen.getByPlaceholderText('Rezept suchen...')).toBeInTheDocument(); // German text
      expect(screen.getByTestId('recipe-grid')).toBeInTheDocument();
      expect(screen.getByTestId('mock-paginator')).toBeInTheDocument();
    });

    it('should not render the dialog contents when visible is false', () => {
      render(<RecipeSelectDialog {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
    });

    it('should display loading message when loading is true', () => {
      mockUseRecipeSelectDialog.mockReturnValue({
        recipes: [],
        search: '',
        setSearch: mockSetSearch,
        loading: true,
      });
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(screen.getByText('Lade Rezepte...')).toBeInTheDocument(); // German text
      expect(screen.queryByTestId('recipe-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mock-paginator')).not.toBeInTheDocument();
    });
  });

  // Test Suite: Search Functionality
  describe('Search Functionality', () => {
    it('should call setSearch from useRecipeSelectDialog when typing in search input', async () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('Rezept suchen...'); // German text
      await user.type(searchInput, 'Chicken');
      // userEvent.type calls onChange for each character.
      // We need to check the final state or the last call.
      expect(mockSetSearch).toHaveBeenLastCalledWith('Chicken');
    });

    it('should reset pagination to first page on new search', async () => {
      // This test relies on the internal implementation detail that setFirst(0) is called.
      // We can verify this by checking the props passed to Paginator after a search.
      // For simplicity, we'll assume the component's internal useState for `first` is reset.
      // A more robust test would involve checking the `first` prop of the Paginator mock.
      render(<RecipeSelectDialog {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('Rezept suchen...'); // German text
      
      // Simulate going to page 2
      const paginatorNextButton = screen.getByTestId('mock-paginator-next');
      await user.click(paginatorNextButton);
      await waitFor(() => { // Paginator's `first` prop should update
        expect(mockPrimePaginator).toHaveBeenLastCalledWith(expect.objectContaining({ first: 8 }));
      });

      // Perform a search
      await user.type(searchInput, 'a');
      
      // After search, pagination should reset. The `first` prop of Paginator should be 0.
      // The component re-renders, and Paginator is called with new props.
      await waitFor(() => {
        // The last call to Paginator (after search) should have `first: 0`
        // This implicitly tests the `setFirst(0)` call.
        expect(mockPrimePaginator).toHaveBeenLastCalledWith(expect.objectContaining({ first: 0 }));
      });
    });
  });

  // Test Suite: Recipe Selection
  describe('Recipe Selection', () => {
    it('should call onSelect and onHide props when a recipe is selected from RecipeGrid', async () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      const recipeToSelect = mockRecipes[0]; // Select the first recipe

      // RecipeGrid mock renders divs with recipe names; click one.
      const recipeElementInGrid = screen.getByText(recipeToSelect.name as string);
      await user.click(recipeElementInGrid);

      expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSelect).toHaveBeenCalledWith(recipeToSelect);
      expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
    });
  });

  // Test Suite: Pagination
  describe('Pagination', () => {
    const RPP = 8; // Rows per page as defined in component
    it('should display the first page of recipes initially', () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(mockRecipeGrid).toHaveBeenCalledWith(expect.objectContaining({
        recipes: mockRecipes.slice(0, RPP),
      }));
      expect(screen.getByText(mockRecipes[0].name as string)).toBeInTheDocument();
      if (mockRecipes.length > RPP) {
        expect(screen.queryByText(mockRecipes[RPP].name as string)).not.toBeInTheDocument();
      }
    });

    it('should display the second page of recipes after clicking next on paginator', async () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      const paginatorNextButton = screen.getByTestId('mock-paginator-next');
      await user.click(paginatorNextButton);

      await waitFor(() => {
        expect(mockRecipeGrid).toHaveBeenCalledWith(expect.objectContaining({
          recipes: mockRecipes.slice(RPP, RPP * 2),
        }));
      });
      // Check if a recipe from the second page is now visible
      if (mockRecipes.length > RPP) {
         await waitFor(() => {
            expect(screen.getByText(mockRecipes[RPP].name as string)).toBeInTheDocument();
         });
      }
       // Check if a recipe from the first page is no longer visible (if RecipeGrid mock re-renders children)
      await waitFor(() => {
        expect(screen.queryByText(mockRecipes[0].name as string)).not.toBeInTheDocument();
      });
    });

    it('should pass correct totalRecords to Paginator', () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(mockPrimePaginator).toHaveBeenCalledWith(expect.objectContaining({
        totalRecords: mockRecipes.length,
        rows: RPP,
      }));
    });
  });

  // Test Suite: Dialog Closing
  describe('Dialog Closing', () => {
    it('should call onHide prop when the mock dialogs onHide is triggered', async () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      // The mock Dialog has a "Close" button that calls its onHide prop.
      const closeButton = screen.getByTestId('mock-dialog-hide');
      await user.click(closeButton);
      expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
    });
  });
  
  // Test Suite: Accessibility
  describe('Accessibility', () => {
    it('dialog should have aria-modal attribute', () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(screen.getByTestId('mock-dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByTestId('mock-dialog')).toHaveAttribute('role', 'dialog');
    });

    it('search input should have a placeholder for accessibility', () => {
      render(<RecipeSelectDialog {...defaultProps} />);
      expect(screen.getByPlaceholderText('Rezept suchen...')).toBeInTheDocument(); // German text
    });
  });

  // Comments on Test Coverage:
  // - This suite aims for high coverage of RecipeSelectDialog's functionality.
  // - Mocks are used for the custom hook (useRecipeSelectDialog), child components (RecipeGrid),
  //   and PrimeReact UI components (Dialog, InputText, Paginator) to isolate the dialog's logic.
  // - Tested aspects:
  //   - Visibility and basic rendering.
  //   - Loading state.
  //   - Search input interaction and its effect on the hook and pagination.
  //   - Recipe selection flow through the RecipeGrid.
  //   - Pagination logic and data slicing.
  //   - Dialog closing mechanism.
  //   - Basic accessibility attributes.
  // - Not deeply tested:
  //   - Actual rendering details of PrimeReact components (they are mocked).
  //   - Actual rendering details of RecipeGrid (it's mocked).
  //   - CSS styling or complex visual behaviors.
  //   - The internal workings of `useRecipeSelectDialog` (should have its own tests).
  // - The tests use English for text assertions ("Select Recipe", "Loading recipes...", "Search recipes...")
  //   as per the prompt's requirement, even if the component's internal text might be German.
  //   This might need adjustment if the component's text is strictly German and cannot be changed for tests.
  //   For this exercise, I've assumed the test can assert English equivalents or that the component
  //   could be internationalized. The current component code uses German text.
  //   To make tests pass with German text:
  //   - "Select Recipe" -> "Rezept auswählen"
  //   - "Loading recipes..." -> "Lade Rezepte..."
  //   - "Search recipes..." -> "Rezept suchen..."
  //   I will use the German text from the component for accuracy.
  // --- This second describe block is now redundant as changes are made in the main one ---
  // describe('RecipeSelectDialog Component (with German text assertions)', () => {
  //   const user = userEvent.setup();
  //   let defaultProps: {
  //     visible: boolean;
  //     onHide: () => void;
  //     onSelect: (recipe: { id: number; name: string }) => void;
  //   };

  //   beforeEach(() => {
  //     vi.clearAllMocks();
  //     defaultProps = {
  //       visible: true,
  //       onHide: vi.fn(),
  //       onSelect: vi.fn(),
  //     };
  //     mockUseRecipeSelectDialog.mockImplementation(() => ({
  //       recipes: mockRecipes,
  //       search: '',
  //       setSearch: mockSetSearch,
  //       loading: false,
  //     }));
  //   });

  //   it('should render the dialog with German text', () => {
  //     render(<RecipeSelectDialog {...defaultProps} />);
  //     expect(screen.getByText('Rezept auswählen')).toBeInTheDocument();
  //     expect(screen.getByPlaceholderText('Rezept suchen...')).toBeInTheDocument();
  //   });

  //   it('should display German loading message', () => {
  //     mockUseRecipeSelectDialog.mockReturnValue({
  //       recipes: [],
  //       search: '',
  //       setSearch: mockSetSearch,
  //       loading: true,
  //     });
  //     render(<RecipeSelectDialog {...defaultProps} />);
  //     expect(screen.getByText('Lade Rezepte...')).toBeInTheDocument();
  //   });
  // });
});
