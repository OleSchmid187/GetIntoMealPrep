import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PlannerCell from './PlannerCell';
import { mealType as mealTypeEnum } from '../../../types/mealType';
import { MealPlanEntry } from '../useMealPlan';

// Use vi.hoisted to define mockPlannerMealCard
// This ensures mockPlannerMealCard is initialized before the vi.mock factory below uses it.
const { mockPlannerMealCard } = vi.hoisted(() => {
  return { mockPlannerMealCard: vi.fn() };
});

// Mock PlannerMealCard using the hoisted mockPlannerMealCard
vi.mock('../PlannerMealCard/PlannerMealCard', () => ({
  default: mockPlannerMealCard,
}));

// Mock react-dnd's useDrop hook
// We need to control the drop behavior to test the onMove callback.
const mockDropConnector = vi.fn(); // This is the connector function (dropRef in PlannerCell)
let capturedDropHandler: ((item: { entry: MealPlanEntry }) => void) | undefined;

vi.mock('react-dnd', async () => {
  const actual = await vi.importActual('react-dnd'); // Import actual to preserve other exports
  return {
    ...actual,
    useDrop: vi.fn((spec) => {
      // The spec can be an object or a function that returns an object.
      // In PlannerCell, it's an object directly.
      const currentSpec = typeof spec === 'function' ? spec() : spec;
      if (currentSpec && typeof currentSpec.drop === 'function') {
        capturedDropHandler = currentSpec.drop;
      }
      return [{}, mockDropConnector]; // Return mock collector and mock connector ref
    }),
  };
});

// Define the specific type for the recipe object as expected by MealPlanEntry
type MealPlanEntryRecipeMock = {
  id: number;
  name: string;
  imageUrl: string; // This must be a string
};

// Helper to create mock MealPlanEntry objects for testing
const createMockMealPlanEntry = (id: number, recipeName?: string, recipeImageUrl?: string): MealPlanEntry => {
  let recipeForEntry: MealPlanEntryRecipeMock | undefined = undefined;

  if (recipeName) {
    recipeForEntry = {
      id: id, 
      name: recipeName,
      imageUrl: recipeImageUrl === undefined ? "" : recipeImageUrl, // Ensure imageUrl is always a string
    };
  }

  return {
    id: id,
    date: '2024-01-01',
    mealType: mealTypeEnum.Breakfast,
    recipeId: id, 
    recipe: recipeForEntry, // Assign the correctly typed object
    position: 0,
  };
};

describe('PlannerCell Component', () => {
  // Define default props to be used in tests, can be overridden per test case.
  const defaultProps = {
    mealType: mealTypeEnum.Breakfast, // Use mealType enum
    day: 'montag', // German for Monday
    weekOffset: 0,
    meals: [],
    onAdd: vi.fn(),
    onMove: vi.fn(),
    onDelete: vi.fn(),
    lastAddedId: null,
  };

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation.
    vi.clearAllMocks();

    // Provide a default implementation for the mocked PlannerMealCard.
    // This allows checking props passed to it.
    mockPlannerMealCard.mockImplementation(({ name, imageUrl, highlight, onDelete, entry }) => (
      <div data-testid={`meal-card-${entry.id}`} data-highlight={highlight}>
        <span>{name || `Recipe ${entry.id}`}</span>
        {imageUrl && <img src={imageUrl} alt={name || `Recipe ${entry.id}`} />}
        <button aria-label={`Delete ${name || `Recipe ${entry.id}`}`} onClick={() => onDelete(entry.id)}>Delete Mock</button>
      </div>
    ));
    
    // Reset the captured drop handler from useDrop mock.
    capturedDropHandler = undefined;
  });

  afterEach(() => {
    // Restore real timers if fake timers were used in a test.
    vi.useRealTimers();
  });

  // Test Suite: Rendering
  // This suite focuses on verifying the visual output of the PlannerCell component
  // under various props and conditions.
  describe('Rendering', () => {
    // Test Case: Basic rendering with no meals.
    // Verifies that the cell renders its fundamental structure (e.g., the add button)
    // even when there are no meals to display.
    it('should render correctly with basic props and no meals', () => {
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} />
            </tr>
          </tbody>
        </table>
      );
      // The add button should always be present for user interaction.
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
      // No meal cards should be rendered if the meals array is empty.
      expect(mockPlannerMealCard).not.toHaveBeenCalled();
    });

    // Test Case: Rendering with multiple meals.
    // Verifies that for each meal entry provided, a PlannerMealCard component is rendered.
    // It also checks if props are correctly passed to these child components.
    it('should render meal cards when meals are provided', () => {
      const meals = [
        createMockMealPlanEntry(1, 'Pancakes', 'pancakes.jpg'),
        createMockMealPlanEntry(2, 'Omelette'), // For this one, recipeImageUrl is undefined, so imageUrl becomes ""
      ];
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} />
            </tr>
          </tbody>
        </table>
      );

      // Expect PlannerMealCard to be called for each meal.
      expect(mockPlannerMealCard).toHaveBeenCalledTimes(2);
      // Verify props for the first meal card.
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: meals[0],
          name: 'Pancakes',
          imageUrl: 'pancakes.jpg', // This comes from meals[0].recipe.imageUrl
          highlight: false,
          onDelete: defaultProps.onDelete,
        }),
        undefined 
      );
      // Verify props for the second meal card.
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: meals[1],
          name: 'Omelette',
          imageUrl: "", // meals[1].recipe.imageUrl will be "" due to the mock logic
          highlight: false,
          onDelete: defaultProps.onDelete,
        }),
        undefined 
      );
    });

    // Test Case: Meal name fallback logic.
    // The component displays a default name "Gericht [index+1]" (German for "Dish") if a recipe name is missing.
    // This test ensures this fallback mechanism works as expected.
    it('should use a default name for meals if recipe name is missing', () => {
      const meals = [{ ...createMockMealPlanEntry(1), recipe: undefined }]; // Meal without a recipe object
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} />
            </tr>
          </tbody>
        </table>
      );
      
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Gericht 1', // Fallback name uses 1-based index.
        }),
        undefined // Add undefined for the second argument
      );
    });

    // Test Case: Highlighting the last added meal.
    // Verifies that the `highlight` prop is true for the PlannerMealCard whose entry ID matches `lastAddedId`.
    it('should highlight the last added meal when lastAddedId matches', () => {
      const meals = [
        createMockMealPlanEntry(1, 'Cereal'),
        createMockMealPlanEntry(2, 'Toast'), // This meal should be highlighted
      ];
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} lastAddedId={2} />
            </tr>
          </tbody>
        </table>
      );

      // Meal 1 (ID 1) should not be highlighted.
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({ entry: meals[0], highlight: false }),
        undefined // Add undefined for the second argument
      );
      // Meal 2 (ID 2) should be highlighted.
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({ entry: meals[1], highlight: true }),
        undefined // Add undefined for the second argument
      );
    });

    // Test Case: No highlighting if lastAddedId is null.
    // Ensures that no meal is highlighted if `lastAddedId` is explicitly null.
    it('should not highlight any meal if lastAddedId is null', () => {
      const meals = [createMockMealPlanEntry(1, 'Salad')];
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} lastAddedId={null} />
            </tr>
          </tbody>
        </table>
      );
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({ entry: meals[0], highlight: false }),
        undefined // Add undefined for the second argument
      );
    });

    // Test Case: No highlighting if lastAddedId does not match any meal.
    // Ensures no meal is highlighted if `lastAddedId` is a non-matching ID.
    it('should not highlight any meal if lastAddedId does not match any meal ID', () => {
      const meals = [createMockMealPlanEntry(1, 'Soup')];
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} lastAddedId={99} />
            </tr>
          </tbody>
        </table>
      ); // 99 is a non-matching ID
      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({ entry: meals[0], highlight: false }),
        undefined // Add undefined for the second argument
      );
    });
  });

  // Test Suite: Interactions
  // This suite tests user interactions with the PlannerCell, such as clicking buttons
  // or drag-and-drop operations, and verifies the correct callback functions are triggered.
  describe('Interactions', () => {
    const user = userEvent.setup();

    // Test Case: Add button click functionality.
    // Verifies that clicking the "add" button correctly calls the `onAdd` prop
    // with the cell's `mealType` and `day`.
    it('should call onAdd with correct parameters when the add button is clicked', async () => {
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} mealType={mealTypeEnum.Lunch} day="dienstag" />
            </tr>
          </tbody>
        </table>
      ); // Dienstag is German for Tuesday
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
      expect(defaultProps.onAdd).toHaveBeenCalledWith(mealTypeEnum.Lunch, 'dienstag'); // Use mealType enum
    });

    // Test Case: Drag and drop functionality (onMove callback).
    // Simulates a meal entry being dropped onto the cell and verifies that the `onMove` callback
    // is triggered with appropriate arguments, including a correctly calculated target date and position.
    it('should call onMove with correct parameters when a meal entry is dropped', () => {
      // Set a fixed system date for consistent date calculations during the test.
      // January 15, 2024, is a Monday.
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));

      const draggedEntry = createMockMealPlanEntry(100, 'Dragged Recipe');
      const existingMealsInCell = [createMockMealPlanEntry(1)]; // Cell already contains one meal
      
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell
                {...defaultProps}
                mealType={mealTypeEnum.Dinner} // Use mealType enum
                day="mittwoch" // German for Wednesday
                weekOffset={0} // Current week
                meals={existingMealsInCell}
              />
            </tr>
          </tbody>
        </table>
      );

      // The useDrop mock captures the drop handler. We must call it to simulate a drop.
      expect(capturedDropHandler).toBeDefined();
      if (capturedDropHandler) {
        capturedDropHandler({ entry: draggedEntry });
      }

      // Verify onMove was called with expected parameters.
      // Target date: Current week (starts Jan 15), Wednesday. So, Jan 17, 2024.
      // Position: Should be the length of the meals array in the cell, as it's added at the end.
      expect(defaultProps.onMove).toHaveBeenCalledTimes(1);
      expect(defaultProps.onMove).toHaveBeenCalledWith(
        draggedEntry.id,        // ID of the dragged item
        mealTypeEnum.Dinner,               // mealType of the target cell - Use mealType enum
        '2024-01-17',           // Calculated targetDate (Jan 15 is Mon, Mittwoch is +2 days)
        existingMealsInCell.length // Position (index for the new item, which is current length)
      );
    });

    // Test Case: onDelete prop passing.
    // Verifies that the `onDelete` handler from props is correctly passed down to each `PlannerMealCard`.
    // This ensures that PlannerMealCard can initiate the deletion process.
    it('should pass the onDelete handler to PlannerMealCard for each meal', () => {
      const meals = [createMockMealPlanEntry(1, 'Pasta')];
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} meals={meals} />
            </tr>
          </tbody>
        </table>
      );

      expect(mockPlannerMealCard).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: meals[0],
          onDelete: defaultProps.onDelete, // Ensure the onDelete prop is passed through
        }),
        undefined // Add undefined for the second argument
      );
    });
  });

  // Test Suite: Date Calculation for Drag and Drop (onMove)
  // This suite specifically tests the date calculation logic within the drop handler.
  // It ensures that target dates are correctly determined based on `day`, `weekOffset`,
  // and the mocked current system date.
  describe('Date Calculation for Drag and Drop (onMove)', () => {
    const draggedEntry = createMockMealPlanEntry(200, 'Test Drop Recipe');

    beforeEach(() => {
      // Use fake timers for all date calculation tests.
      vi.useFakeTimers();
    });

    // Test Case: Date calculation for Monday, current week.
    // System date is set to a Wednesday. Target is Monday of the same week.
    it('should calculate correct target date for Monday, current week (weekOffset 0)', () => {
      vi.setSystemTime(new Date('2024-01-17T12:00:00.000Z')); // Wednesday, Jan 17, 2024
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} day="montag" weekOffset={0} meals={[]} mealType={mealTypeEnum.Breakfast} />
            </tr>
          </tbody>
        </table>
      );
      
      expect(capturedDropHandler).toBeDefined();
      if (capturedDropHandler) capturedDropHandler({ entry: draggedEntry });

      // Monday of the week of Jan 17, 2024 is Jan 15, 2024.
      expect(defaultProps.onMove).toHaveBeenCalledWith(
        draggedEntry.id, defaultProps.mealType, '2024-01-15', 0
      );
    });

    // Test Case: Date calculation for Sunday, next week.
    // System date is Wednesday. Target is Sunday of the following week.
    it('should calculate correct target date for Sunday, next week (weekOffset 1)', () => {
      vi.setSystemTime(new Date('2024-01-17T12:00:00.000Z')); // Wednesday, Jan 17, 2024
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} day="sonntag" weekOffset={1} meals={[]} mealType={mealTypeEnum.Snack1} />
            </tr>
          </tbody>
        </table>
      ); // Sonntag is German for Sunday
      
      expect(capturedDropHandler).toBeDefined();
      if (capturedDropHandler) capturedDropHandler({ entry: draggedEntry });

      // Monday of current week: Jan 15. Monday of next week: Jan 22. Sunday of next week: Jan 28.
      expect(defaultProps.onMove).toHaveBeenCalledWith(
        draggedEntry.id, mealTypeEnum.Snack1, '2024-01-28', 0
      );
    });

    // Test Case: Date calculation for Friday, previous week.
    // System date is Wednesday. Target is Friday of the preceding week.
    it('should calculate correct target date for Friday, previous week (weekOffset -1)', () => {
      vi.setSystemTime(new Date('2024-01-17T12:00:00.000Z')); // Wednesday, Jan 17, 2024
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} day="freitag" weekOffset={-1} meals={[]} mealType={mealTypeEnum.Lunch} />
            </tr>
          </tbody>
        </table>
      ); // Freitag is German for Friday
      
      expect(capturedDropHandler).toBeDefined();
      if (capturedDropHandler) capturedDropHandler({ entry: draggedEntry });

      // Monday of current week: Jan 15. Monday of previous week: Jan 8. Friday of previous week: Jan 12.
      expect(defaultProps.onMove).toHaveBeenCalledWith(
        draggedEntry.id, mealTypeEnum.Lunch, '2024-01-12', 0
      );
    });

    // Test Case: Date calculation when current day is Sunday.
    // System date is Sunday. Target is Monday of the same week (which was 6 days prior).
    // This tests the `(baseMonday.getDay() + 6) % 7` logic for Sundays (getDay() === 0).
    it('should calculate correct target date for Monday, current week, when system time is Sunday', () => {
      vi.setSystemTime(new Date('2024-01-21T12:00:00.000Z')); // Sunday, Jan 21, 2024
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} day="montag" weekOffset={0} meals={[]} mealType={mealTypeEnum.Dinner} />
            </tr>
          </tbody>
        </table>
      );
      
      expect(capturedDropHandler).toBeDefined();
      if (capturedDropHandler) capturedDropHandler({ entry: draggedEntry });

      // For Sunday Jan 21, the preceding Monday is Jan 15.
      expect(defaultProps.onMove).toHaveBeenCalledWith(
        draggedEntry.id, mealTypeEnum.Dinner, '2024-01-15', 0
      );
    });
  });

  // Test Suite: Accessibility
  // This suite includes basic accessibility checks for the component.
  describe('Accessibility', () => {
    // Test Case: Add button accessibility.
    // Verifies that the add button has an accessible name, crucial for users relying on assistive technologies.
    it('should have an accessible add button', () => {
      render(
        <table>
          <tbody>
            <tr>
              <PlannerCell {...defaultProps} />
            </tr>
          </tbody>
        </table>
      );
      // The MdAdd icon is rendered inside the button. React Testing Library's `name` option
      // checks for accessible names (e.g., from aria-label, text content, or SVG title).
      // This test assumes MdAdd (from react-icons) provides an accessible name like "add".
      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
      // Further checks could involve `toHaveAccessibleName` if more specific assertions are needed.
    });
  });

  // Comments on Test Coverage:
  // - This test suite aims for high coverage of the PlannerCell component's logic, including rendering variations,
  //   user interactions (add, drop), prop handling, and critical internal logic like date calculations.
  // - What's not covered:
  //   - The actual drag mechanics (e.g., `isDragging` state, visual feedback during drag) provided by `react-dnd`,
  //     as `useDrop` is mocked. Testing these would require more complex integration tests with a DndProvider.
  //   - Deep CSS styling verification. Tests focus on functional aspects and data flow.
  //   - The behavior of the `PlannerMealCard` component itself, as it's mocked. It should have its own dedicated tests.
});
