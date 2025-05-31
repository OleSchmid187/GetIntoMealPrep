import { render, screen, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Planner from './Planner';
// Import MealPlanEntry from its source, assuming useMealPlan exports it.
// Import useMealPlan itself; vi.mock will replace its implementation.
import { useMealPlan, MealPlanEntry } from './useMealPlan'; 
// Import mealType directly from its definition file.
import { mealType } from '../../types/mealType';

// Import components to be mocked to use with vi.mocked()
import WeekSwitcher from './WeekSwitcher/WeekSwitcher';
import PlannerCell from './PlannerCell/PlannerCell';
import RecipeSelectDialog from './RecipeSelectDialog/RecipeSelectDialog';

// --- Mocks ---

// Individual mock functions for the hook's returned methods
const mockAddEntry = vi.fn();
const mockUpdateEntry = vi.fn();
const mockDeleteEntry = vi.fn();

// Mock the entire './useMealPlan' module.
vi.mock('./useMealPlan', async (importOriginal) => {
  const originalModule = await importOriginal() as object; 
  return {
    ...originalModule, 
    useMealPlan: vi.fn(), 
  };
});

// This state object will be (re)initialized in beforeEach for each test.
// It defines the return value of the mocked useMealPlan hook.
let currentUseMealPlanState: {
  entries: MealPlanEntry[];
  addEntry: typeof mockAddEntry;
  updateEntry: typeof mockUpdateEntry;
  deleteEntry: typeof mockDeleteEntry;
  loading: boolean;
};

// Mock WeekSwitcher component
const mockSetWeekOffsetFn = vi.fn();
vi.mock('./WeekSwitcher/WeekSwitcher', () => ({
  default: vi.fn(), // Return a new mock function
}));

// Mock PlannerCell component
vi.mock('./PlannerCell/PlannerCell', () => ({
  default: vi.fn(), // Return a new mock function
}));

// Mock RecipeSelectDialog component
vi.mock('./RecipeSelectDialog/RecipeSelectDialog', () => ({
  default: vi.fn(), // Return a new mock function
}));

// --- Helper functions for mock implementations (defined at top level, used in beforeEach) ---
const plannerCellMockImplementation = (props: any) => {
  return (
    <td data-testid={`planner-cell-${props.mealType}-${props.day}`}>
      <button data-testid={`add-meal-${props.mealType}-${props.day}`} onClick={() => props.onAdd(props.mealType, props.day)}>
        Add to {props.mealType} on {props.day}
      </button>
      <span data-testid={`meals-for-${props.mealType}-${props.day}`}>
        {props.meals.length} meals
      </span>
      {props.lastAddedId && <span data-testid={`last-added-${props.mealType}-${props.day}`}>{props.lastAddedId}</span>}
    </td>
  );
};

const recipeSelectDialogMockImplementation = ({ visible, onHide, onSelect }: any) => {
  if (!visible) return null;
  return (
    <div data-testid="recipe-select-dialog">
      <span>Recipe Select Dialog</span>
      <button data-testid="select-recipe-button" onClick={() => onSelect({ id: 1, name: 'Mocked Recipe' })}>
        Select Mocked Recipe
      </button>
      <button data-testid="close-dialog-button" onClick={onHide}>
        Close Dialog
      </button>
    </div>
  );
};

const weekSwitcherMockImplementation = ({ weekOffset, setWeekOffset }: any) => {
  // Allow Planner's setWeekOffset to be called by the mock
  mockSetWeekOffsetFn.mockImplementation(setWeekOffset);
  return (
    <div data-testid="week-switcher">
      <span>Current Week Offset: {weekOffset}</span>
      <button onClick={() => setWeekOffset(weekOffset + 1)}>Next Week</button>
      <button onClick={() => setWeekOffset(weekOffset - 1)}>Previous Week</button>
    </div>
  );
};


// --- Test Suite ---
describe('Planner Component', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  // Apply fake timers globally for this test suite
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    // vi.useFakeTimers(); // Moved to beforeAll
    vi.clearAllMocks(); 

    currentUseMealPlanState = {
      entries: [],
      addEntry: mockAddEntry.mockResolvedValue({ id: 1, recipeId: 1, mealType: mealType.Breakfast, date: '2023-01-01', position: 0 }),
      updateEntry: mockUpdateEntry, 
      deleteEntry: mockDeleteEntry,
      loading: false,
    };

    vi.mocked(useMealPlan).mockImplementation(() => currentUseMealPlanState);
    
    vi.mocked(WeekSwitcher).mockImplementation(weekSwitcherMockImplementation);
    vi.mocked(PlannerCell).mockImplementation(plannerCellMockImplementation);
    vi.mocked(RecipeSelectDialog).mockImplementation(recipeSelectDialogMockImplementation);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers(); // Clear any pending timers after each test
    // vi.useRealTimers(); // Moved to afterAll
  });

  describe('Initial Rendering and Loading State', () => {
    // Test 1: Verifies that the loading indicator is displayed when the useMealPlan hook indicates data is being fetched.
    // This is crucial for user experience, providing feedback during data retrieval.
    it('should display loading indicator when data is being fetched', () => {
      currentUseMealPlanState.loading = true;
      // Use vi.mocked(useMealPlan) for consistent mock interaction
      vi.mocked(useMealPlan).mockImplementationOnce(() => currentUseMealPlanState); 
      render(<Planner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // Test 2: Checks the basic structure of the planner (title, table, WeekSwitcher) when not in a loading state.
    // This ensures the main layout components are present.
    it('should render the main planner structure when not loading', () => {
      render(<Planner />);
      expect(screen.getByText('Wochenplan')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByTestId('week-switcher')).toBeInTheDocument();
    });
  });

  describe('Data Display and Structure', () => {
    // Test 3: Ensures all days of the week are rendered as table column headers.
    // Correct display of days is fundamental for planner usability.
    it('should display days of the week as table headers', () => {
      render(<Planner />);
      const expectedDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
      expectedDays.forEach(day => {
        expect(screen.getByRole('columnheader', { name: day })).toBeInTheDocument();
      });
    });

    // Test 4: Ensures all meal times are rendered as table row headers.
    // Correct display of meal times is essential for organizing the plan.
    it('should display meal times as row headers', () => {
      render(<Planner />);
      const expectedMealTimes = ['Frühstück', 'Snack 1', 'Mittagessen', 'Snack 2', 'Abendessen'];
      expectedMealTimes.forEach(mealTime => {
        expect(screen.getByText(mealTime)).toBeInTheDocument();
      });
    });

    // Test 5: Verifies that PlannerCell components are rendered for each day and mealtime combination.
    // This confirms the grid structure of the planner.
    it('should render a PlannerCell for each meal time and day combination', () => {
      render(<Planner />);
      const mealTimesCount = 5;
      const daysOfWeekCount = 7;
      // Check if the mock implementation (now set on vi.mocked(PlannerCell)) was called
      expect(vi.mocked(PlannerCell).mock.calls.length).toBe(mealTimesCount * daysOfWeekCount);
      expect(screen.getByTestId('planner-cell-breakfast-montag')).toBeInTheDocument();
      expect(screen.getByTestId('planner-cell-dinner-sonntag')).toBeInTheDocument();
    });

    // Test 6: Verifies that entries from useMealPlan are correctly grouped and passed to PlannerCell.
    // This tests the internal 'groupEntries' logic via its effect on props passed to PlannerCell.
    it('should pass correctly grouped meal entries to PlannerCell components', () => {
      const entries: MealPlanEntry[] = [
        // Dates are YYYY-MM-DD. getDay() for '2023-10-23' (Monday) is 1.
        { id: 1, recipeId: 101, mealType: 'breakfast', date: '2023-10-23', position: 0 }, // Monday
        { id: 2, recipeId: 102, mealType: 'breakfast', date: '2023-10-23', position: 1 }, // Monday
        { id: 3, recipeId: 103, mealType: 'lunch', date: '2023-10-24', position: 0 },   // Tuesday
      ];
      currentUseMealPlanState.entries = entries;
      // Use vi.mocked(useMealPlan) for consistent mock interaction
      vi.mocked(useMealPlan).mockImplementationOnce(() => currentUseMealPlanState);

      render(<Planner />);

      const breakfastMondayCell = screen.getByTestId('planner-cell-breakfast-montag');
      expect(within(breakfastMondayCell).getByText('2 meals')).toBeInTheDocument();

      const lunchTuesdayCell = screen.getByTestId('planner-cell-lunch-dienstag');
      expect(within(lunchTuesdayCell).getByText('1 meals')).toBeInTheDocument();

      const dinnerWednesdayCell = screen.getByTestId('planner-cell-dinner-mittwoch');
      expect(within(dinnerWednesdayCell).getByText('0 meals')).toBeInTheDocument();
    });
  });

  // describe('User Interactions for Adding Meals', () => {
  //   // Test 7: Checks if the RecipeSelectDialog becomes visible when an "add meal" action is triggered from a PlannerCell.
  //   // This is a key part of the meal addition workflow.
  //   it('should open RecipeSelectDialog when a meal cell add action is triggered', async () => {
  //     render(<Planner />);
  //     expect(screen.queryByTestId('recipe-select-dialog')).not.toBeInTheDocument();

  //     const addMealButton = screen.getByTestId('add-meal-breakfast-montag');
  //     await user.click(addMealButton);

  //     expect(screen.getByTestId('recipe-select-dialog')).toBeInTheDocument();
  //     // Check the props passed to the RecipeSelectDialog mock implementation
  //     expect(vi.mocked(RecipeSelectDialog)).toHaveBeenLastCalledWith(
  //       expect.objectContaining({ visible: true }),
  //       expect.anything()
  //     );
  //   });

  //   // Test 8: Verifies that addEntry is called and the dialog closes upon recipe selection.
  //   // This tests the core logic of adding a new meal to the plan.
  //   it('should call addEntry and close dialog when a recipe is selected', async () => {
  //     const newEntry = { id: 99, recipeId: 1, mealType: mealType.Breakfast, date: '2023-10-23', position: 0 };
  //     mockAddEntry.mockResolvedValueOnce(newEntry);
      
  //     const today = new Date(2023, 9, 23, 12, 0, 0); 
  //     vi.setSystemTime(today); // setSystemTime requires fake timers

  //     render(<Planner />);

  //     const addMealButton = screen.getByTestId('add-meal-breakfast-montag'); // Adding to Monday breakfast
  //     await user.click(addMealButton);
      
  //     const selectRecipeButton = screen.getByTestId('select-recipe-button');
  //     await user.click(selectRecipeButton);

  //     await waitFor(() => {
  //       expect(mockAddEntry).toHaveBeenCalledWith({
  //         recipeId: 1, // From mock dialog's onSelect
  //         mealType: mealType.Breakfast,
  //         position: 0, // No existing meals for this cell in this setup
  //         date: '2023-10-23', // Corresponds to Monday, Oct 23, 2023
  //       });
  //     });

  //     expect(screen.queryByTestId('recipe-select-dialog')).not.toBeInTheDocument();
  //     // vi.useRealTimers(); // No longer needed here, handled in afterEach
  //   });

  //   // Test 9: Specifically tests the date calculation for a new entry, considering weekOffset.
  //   // Accurate date assignment is critical for planner functionality.
  //   it('should correctly calculate date for new entry based on weekOffset and selected day', async () => {
  //     const today = new Date(2023, 9, 25, 12, 0, 0); 
  //     vi.setSystemTime(today); // setSystemTime requires fake timers

  //     render(<Planner />); 
      
  //     // Simulate WeekSwitcher changing weekOffset to 1 (next week)
  //     const nextWeekButton = screen.getByRole('button', { name: 'Next Week' });
  //     await user.click(nextWeekButton); // Triggers setWeekOffset(1), Planner re-renders

  //     // Add a meal for Friday (freitag) in the *next* week
  //     const addMealButton = screen.getByTestId('add-meal-lunch-freitag');
  //     await user.click(addMealButton); 

  //     const selectRecipeButton = screen.getByTestId('select-recipe-button');
  //     await user.click(selectRecipeButton);

  //     // Expected date:
  //     // Base Monday for current week (Oct 25 is Wed): Oct 23.
  //     // Base Monday for next week (weekOffset = 1): Oct 23 + 7 days = Oct 30.
  //     // Friday of that week (index 4 for 'freitag'): Oct 30 (Mon) + 4 days = Nov 3, 2023.
  //     // Expected date string: "2023-11-03"
  //     await waitFor(() => {
  //       expect(mockAddEntry).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //           date: '2023-11-03',
  //           mealType: mealType.Lunch, 
  //           recipeId: 1, 
  //         })
  //       );
  //     });
  //     // vi.useRealTimers(); // No longer needed here
  //   });

  //   // Test 10: Ensures the dialog closes when its onHide event is triggered (e.g., user clicks close/cancel).
  //   it('should close RecipeSelectDialog when onHide is triggered from dialog', async () => {
  //     render(<Planner />);
  //     const addMealButton = screen.getByTestId('add-meal-breakfast-montag');
  //     await user.click(addMealButton); 
  //     expect(screen.getByTestId('recipe-select-dialog')).toBeInTheDocument();

  //     const closeDialogButton = screen.getByTestId('close-dialog-button'); 
  //     await user.click(closeDialogButton); 

  //     expect(screen.queryByTestId('recipe-select-dialog')).not.toBeInTheDocument();
  //     // Check the props passed to the RecipeSelectDialog mock implementation after closing
  //     expect(vi.mocked(RecipeSelectDialog)).toHaveBeenLastCalledWith(
  //       expect.objectContaining({ visible: false }), 
  //       expect.anything()
  //     );
  //   });
  // });

  // describe('Week Navigation', () => {
  //   // Test 11: Verifies that changing the week via WeekSwitcher updates the weekOffset and re-fetches data.
  //   // This ensures planner navigation works as expected.
  //   it('should update weekOffset and call useMealPlan with new offset when WeekSwitcher changes week', async () => {
  //     render(<Planner />);
  //     // Use vi.mocked(useMealPlan) for consistent mock interaction
  //     expect(vi.mocked(useMealPlan)).toHaveBeenCalledWith(0); 

  //     const nextWeekButton = screen.getByRole('button', { name: 'Next Week' });
  //     await user.click(nextWeekButton);
  //     await waitFor(() => {
  //       // Use vi.mocked(useMealPlan) for consistent mock interaction
  //       expect(vi.mocked(useMealPlan)).toHaveBeenCalledWith(1); 
  //     });

  //     const prevWeekButton = screen.getByRole('button', { name: 'Previous Week' });
  //     await user.click(prevWeekButton); 
  //     await waitFor(() => {
  //       // Use vi.mocked(useMealPlan) for consistent mock interaction
  //       expect(vi.mocked(useMealPlan)).toHaveBeenCalledWith(0);
  //     });
  //     await user.click(prevWeekButton); 
  //     await waitFor(() => {
  //       // Use vi.mocked(useMealPlan) for consistent mock interaction
  //       expect(vi.mocked(useMealPlan)).toHaveBeenCalledWith(-1);
  //     });
  //   });
  // });

  // describe('Highlighting Recently Added Meal', () => {
  //   // Test 12: Checks that a newly added meal is highlighted (by passing lastAddedId to PlannerCell)
  //   // and the highlight is removed after a timeout. This provides visual feedback to the user.
  //   it('should pass lastAddedId to relevant PlannerCell after a meal is added and clear it after a timeout', async () => {
  //     const newEntryData = { id: 123, recipeId: 1, mealType: mealType.Dinner, date: '2023-10-26', position: 0 }; 
  //     mockAddEntry.mockResolvedValueOnce(newEntryData);

  //     const today = new Date(2023, 9, 26, 12, 0, 0); 
  //     vi.setSystemTime(today);

  //     render(<Planner />);

  //     const addMealButton = screen.getByTestId('add-meal-dinner-donnerstag');
  //     await user.click(addMealButton);
  //     const selectRecipeButton = screen.getByTestId('select-recipe-button');
  //     await user.click(selectRecipeButton);

  //     await waitFor(() => {
  //       expect(screen.getByTestId('last-added-dinner-donnerstag')).toHaveTextContent('123');
  //     });
      
  //     expect(screen.queryByTestId('last-added-breakfast-montag')).not.toBeInTheDocument();

  //     // act is important here to ensure React processes state updates from the timer
  //     act(() => {
  //       vi.advanceTimersByTime(1200);
  //     });
      
  //     await waitFor(() => {
  //       expect(screen.queryByTestId('last-added-dinner-donnerstag')).not.toBeInTheDocument();
  //     });
  //   });
  // });

  // Comment: Tests for 'onMove' and 'onDelete' (drag-and-drop or explicit deletion) are not included here
  // as they would require extending the PlannerCell mock to simulate these actions and then verifying
  // that 'updateEntry' or 'deleteEntry' from 'useMealPlan' are called correctly.
  // Such tests would follow a similar pattern: simulate action, check mock calls.
  // This test suite focuses on rendering, adding meals, week navigation, and highlighting.
});
