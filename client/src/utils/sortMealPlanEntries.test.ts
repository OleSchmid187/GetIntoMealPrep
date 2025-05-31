import { describe, it, expect } from 'vitest';
import { sortMealPlanEntries } from './sortMealPlanEntries';
import { MealPlanEntry } from '../pages/Planner/useMealPlan'; // Correct path for MealPlanEntry
import { mealType } from '../types/mealType'; // Correct path for mealType

// Updated helper function to create MealPlanEntry objects for tests.
// This ensures that test data conforms to the MealPlanEntry type more accurately.
// It populates required fields with dummy data, focusing on 'position'.
const createMealPlanEntry = (
  id: number,
  position: number,
  recipeId: number = id,
  date: string = '2024-01-01',
  mealTypeValue: mealType = mealType.Breakfast
): MealPlanEntry => {
  return {
    id, // Numeric ID as per MealPlanEntry type
    recipeId, // Use recipeId instead of mealId
    date, // Use date string instead of dayOfWeek
    mealType: mealTypeValue, // Use mealType from imported type
    position, // The critical property for sorting
    // The optional 'recipe' property is omitted as it's not relevant for sorting by 'position'.
  };
};

describe('sortMealPlanEntries', () => {
  // Test Case 1: Empty array
  // Verifies the function's behavior when provided with an empty list of meal plan entries.
  // This is a fundamental edge case for any array processing logic.
  it('should return an empty array when given an empty array', () => {
    const entries: MealPlanEntry[] = [];
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected: The function should return a new, empty array.
    expect(sortedEntries).toEqual([]);
    expect(sortedEntries).not.toBe(entries); // Ensure a new array instance is returned.
  });

  // Test Case 2: Array with one entry
  // Checks how the function handles an array containing a single meal plan entry.
  // A single-element array is inherently sorted.
  it('should return the same array (as a new instance) if it contains only one entry', () => {
    const entry1 = createMealPlanEntry(1, 10); // Use numeric ID
    const entries: MealPlanEntry[] = [entry1];
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected: An array containing the single entry, as a new instance.
    expect(sortedEntries).toEqual([entry1]);
    expect(sortedEntries).not.toBe(entries); // Ensure a new array instance.
  });

  // Test Case 3: Already sorted array
  // Validates that the function does not alter the order of an array that is already sorted by position.
  it('should not change the order of an already sorted array', () => {
    const entry1 = createMealPlanEntry(101, 1);
    const entry2 = createMealPlanEntry(102, 5);
    const entry3 = createMealPlanEntry(103, 10);
    const entries: MealPlanEntry[] = [entry1, entry2, entry3];
    
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected: The order of entries should remain unchanged.
    expect(sortedEntries).toEqual([entry1, entry2, entry3]);
    // Verify order by IDs as well for clarity.
    expect(sortedEntries.map(e => e.id)).toEqual([101, 102, 103]);
  });

  // Test Case 4: Reverse sorted array
  // Tests the primary sorting logic with entries initially in descending order of position.
  it('should correctly sort a reverse-sorted array', () => {
    const entry1 = createMealPlanEntry(201, 10);
    const entry2 = createMealPlanEntry(202, 5);
    const entry3 = createMealPlanEntry(203, 1);
    const entries: MealPlanEntry[] = [entry1, entry2, entry3]; // Positions: 10, 5, 1
    
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected: Entries sorted by position in ascending order: entry3 (1), entry2 (5), entry1 (10).
    expect(sortedEntries.map(e => e.id)).toEqual([203, 202, 201]);
    expect(sortedEntries.map(e => e.position)).toEqual([1, 5, 10]);
  });

  // Test Case 5: Unsorted array with unique positive integer positions
  // Assesses the general sorting capability with a mixed order of positive positions.
  it('should correctly sort an unsorted array with various positive integer positions', () => {
    const entry1 = createMealPlanEntry(301, 5);
    const entry2 = createMealPlanEntry(302, 1);
    const entry3 = createMealPlanEntry(303, 10);
    const entry4 = createMealPlanEntry(304, 2);
    const entries: MealPlanEntry[] = [entry1, entry2, entry3, entry4]; // Positions: 5, 1, 10, 2
    
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected order by position: entry2 (1), entry4 (2), entry1 (5), entry3 (10).
    expect(sortedEntries.map(e => e.id)).toEqual([302, 304, 301, 303]);
    expect(sortedEntries.map(e => e.position)).toEqual([1, 2, 5, 10]);
  });

  // Test Case 6: Array with negative and positive positions
  // Ensures the sorting logic correctly handles negative numbers, zero, and positive numbers for positions.
  // 'position' might represent a relative order where negative values are meaningful.
  it('should correctly sort an array containing negative, zero, and positive positions', () => {
    const entry1 = createMealPlanEntry(401, 0);
    const entry2 = createMealPlanEntry(402, -5);
    const entry3 = createMealPlanEntry(403, 5);
    const entry4 = createMealPlanEntry(404, -1);
    const entries: MealPlanEntry[] = [entry1, entry2, entry3, entry4]; // Positions: 0, -5, 5, -1
    
    const sortedEntries = sortMealPlanEntries(entries);

    // Expected order: entry2 (-5), entry4 (-1), entry1 (0), entry3 (5).
    expect(sortedEntries.map(e => e.id)).toEqual([402, 404, 401, 403]);
    expect(sortedEntries.map(e => e.position)).toEqual([-5, -1, 0, 5]);
  });

  // Test Case 7: Array with duplicate positions
  // Tests how items with identical positions are handled. The standard JavaScript sort (`Array.prototype.sort`)
  // is not guaranteed to be stable. This test verifies correct sorting by position.
  // The relative order of items with the same position is not asserted.
  it('should correctly sort an array with duplicate positions', () => {
    const entry1 = createMealPlanEntry(501, 5); 
    const entry2 = createMealPlanEntry(502, 1); 
    const entry3 = createMealPlanEntry(503, 5); // Same position as entry1
    const entry4 = createMealPlanEntry(504, 0); 
    
    const entries: MealPlanEntry[] = [entry1, entry2, entry3, entry4];
    
    const sortedEntries = sortMealPlanEntries(entries);
    const sortedPositions = sortedEntries.map(e => e.position);

    // Expected: Positions should be sorted: 0, 1, 5, 5.
    expect(sortedPositions).toEqual([0, 1, 5, 5]);

    // Verify that the items with position 0 and 1 are correctly placed.
    expect(sortedEntries[0].id).toBe(504); // Position 0
    expect(sortedEntries[1].id).toBe(502); // Position 1

    // Verify that both items with position 5 are present in the sorted list.
    const itemsAtPos5 = sortedEntries.filter(e => e.position === 5);
    expect(itemsAtPos5.length).toBe(2);
    expect(itemsAtPos5.find(e => e.id === 501)).toBeDefined();
    expect(itemsAtPos5.find(e => e.id === 503)).toBeDefined();
  });

  // Test Case 8: Immutability - ensuring the original array is not mutated
  // This is crucial for predictable state management.
  it('should return a new array instance and not mutate the original array', () => {
    const entry1 = createMealPlanEntry(601, 3);
    const entry2 = createMealPlanEntry(602, 1);
    const entry3 = createMealPlanEntry(603, 2);
    const originalEntries: MealPlanEntry[] = [entry1, entry2, entry3];
    
    const originalEntriesStateCopy = originalEntries.map(e => ({ ...e }));
    
    const sortedEntries = sortMealPlanEntries(originalEntries);
    
    expect(sortedEntries).not.toBe(originalEntries);
    expect(originalEntries).toEqual(originalEntriesStateCopy); 
    expect(originalEntries.map(e => e.id)).toEqual([601, 602, 603]);
    expect(originalEntries.map(e => e.position)).toEqual([3, 1, 2]);
  });

  // Test Case 9: Array with a larger number of items
  // Verifies sorting logic with a moderately sized dataset.
  it('should correctly sort a larger array of entries', () => {
    const entries: MealPlanEntry[] = [];
    const itemCount = 50;
    for (let i = 0; i < itemCount; i++) {
      // Add items with positions in reverse order and unique numeric IDs
      entries.push(createMealPlanEntry(700 + i, itemCount - 1 - i));
    }

    const sortedEntries = sortMealPlanEntries(entries);

    const expectedPositions = Array.from({ length: itemCount }, (_, i) => i);
    expect(sortedEntries.map(e => e.position)).toEqual(expectedPositions);

    for (let i = 0; i < itemCount - 1; i++) {
      expect(sortedEntries[i].position).toBeLessThanOrEqual(sortedEntries[i+1].position);
    }
  });
});
