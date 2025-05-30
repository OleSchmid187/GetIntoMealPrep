import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, getWeekRange } from './dateUtils';

/**
 * Test suite for the `formatDate` utility function.
 * This function is responsible for converting a Date object into a string
 * formatted as 'dd.mm.yyyy' specifically for the German locale ('de-DE').
 */
describe('formatDate', () => {
  // Test case: Verifies that a standard date is formatted correctly.
  // Business context: Ensures dates are displayed consistently in the UI.
  it('should format a given Date object to dd.mm.yyyy string in German locale', () => {
    const date = new Date(2023, 9, 15); // October 15, 2023
    expect(formatDate(date)).toBe('15.10.2023');
  });

  // Test case: Verifies formatting for dates at the beginning of a month.
  // Business context: Edge case testing for date formatting.
  it('should correctly format dates at the beginning of a month', () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(formatDate(date)).toBe('01.01.2023');
  });

  // Test case: Verifies formatting for dates at the end of a month.
  // Business context: Edge case testing for date formatting.
  it('should correctly format dates at the end of a month', () => {
    const date = new Date(2023, 0, 31); // January 31, 2023
    expect(formatDate(date)).toBe('31.01.2023');
  });

  // Test case: Verifies formatting for dates with single-digit day and month.
  // Business context: Ensures leading zeros are correctly applied for consistency.
  it('should correctly format dates with single digit day and month', () => {
    const date = new Date(2023, 2, 5); // March 5, 2023
    expect(formatDate(date)).toBe('05.03.2023');
  });

  // Test case: Verifies formatting for a date in December to check month handling.
  // Business context: Ensures correct month representation (e.g., 11 for December).
  it('should correctly format a date in December', () => {
    const date = new Date(2024, 11, 25); // December 25, 2024
    expect(formatDate(date)).toBe('25.12.2024');
  });
});

/**
 * Test suite for the `getWeekRange` utility function.
 * This function calculates the start (Monday) and end (Sunday) dates of a week,
 * based on an offset from the current week. It also provides a formatted label.
 */
describe('getWeekRange', () => {
  // Setup: Use fake timers to control the "current" date for tests.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // Teardown: Restore real timers after each test.
  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to create a date without time component for easier comparison.
  const createDate = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0); // Normalize time for comparison
    return d;
  };
  
  // Helper function to normalize date to the start of the day for comparison
  const normalizeDate = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };


  // Test case: Verifies the week range for the current week (offset 0).
  // Business context: Core functionality for displaying the current week's meal plan.
  it('should return the current week range when offset is 0, current day is Wednesday', () => {
    // Set current date to a Wednesday
    const wednesday = createDate(2023, 9, 18); // October 18, 2023
    vi.setSystemTime(wednesday);

    const result = getWeekRange(0);

    // Expected Monday: October 16, 2023
    // Expected Sunday: October 22, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 9, 16));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 9, 22));
    expect(result.label).toBe('16.10.2023 – 22.10.2023');
  });

  // Test case: Verifies the week range for the next week (offset 1).
  // Business context: Allows users to navigate to and plan for future weeks.
  it('should return the next week range when offset is 1', () => {
    // Set current date to a Wednesday
    const wednesday = createDate(2023, 9, 18); // October 18, 2023
    vi.setSystemTime(wednesday);

    const result = getWeekRange(1);

    // Expected Monday: October 23, 2023
    // Expected Sunday: October 29, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 9, 23));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 9, 29));
    expect(result.label).toBe('23.10.2023 – 29.10.2023');
  });

  // Test case: Verifies the week range for the previous week (offset -1).
  // Business context: Allows users to review past weeks' plans.
  it('should return the previous week range when offset is -1', () => {
    // Set current date to a Wednesday
    const wednesday = createDate(2023, 9, 18); // October 18, 2023
    vi.setSystemTime(wednesday);

    const result = getWeekRange(-1);

    // Expected Monday: October 9, 2023
    // Expected Sunday: October 15, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 9, 9));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 9, 15));
    expect(result.label).toBe('09.10.2023 – 15.10.2023');
  });

  // Test case: Verifies correct calculation when the current day is Monday.
  // Business context: Edge case for the start of the week.
  it('should correctly calculate week range when current day is Monday', () => {
    // Set current date to a Monday
    const mondayDate = createDate(2023, 9, 16); // October 16, 2023
    vi.setSystemTime(mondayDate);

    const result = getWeekRange(0);

    // Expected Monday: October 16, 2023
    // Expected Sunday: October 22, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 9, 16));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 9, 22));
    expect(result.label).toBe('16.10.2023 – 22.10.2023');
  });

  // Test case: Verifies correct calculation when the current day is Sunday.
  // Business context: Edge case for the end of the week (getDay() returns 0 for Sunday).
  it('should correctly calculate week range when current day is Sunday', () => {
    // Set current date to a Sunday
    const sundayDate = createDate(2023, 9, 22); // October 22, 2023
    vi.setSystemTime(sundayDate);

    const result = getWeekRange(0);

    // Expected Monday: October 16, 2023
    // Expected Sunday: October 22, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 9, 16));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 9, 22));
    expect(result.label).toBe('16.10.2023 – 22.10.2023');
  });

  // Test case: Verifies correct handling of week ranges spanning across a year-end.
  // Business context: Ensures accurate date calculations during year transitions.
  it('should handle year transitions correctly for start and end dates (previous year)', () => {
    // Set current date to early January
    const earlyJanuaryDate = createDate(2024, 0, 3); // January 3, 2024 (Wednesday)
    vi.setSystemTime(earlyJanuaryDate);

    const result = getWeekRange(-1); // Previous week

    // Expected Monday: December 25, 2023
    // Expected Sunday: December 31, 2023
    expect(normalizeDate(result.start)).toEqual(createDate(2023, 11, 25));
    expect(normalizeDate(result.end)).toEqual(createDate(2023, 11, 31));
    expect(result.label).toBe('25.12.2023 – 31.12.2023');
  });

  // Test case: Verifies correct handling of week ranges spanning into a new year.
  // Business context: Ensures accurate date calculations during year transitions.
  it('should handle year transitions correctly for start and end dates (next year)', () => {
    // Set current date to late December
    const lateDecemberDate = createDate(2023, 11, 27); // December 27, 2023 (Wednesday)
    vi.setSystemTime(lateDecemberDate);

    const result = getWeekRange(1); // Next week

    // Expected Monday: January 1, 2024
    // Expected Sunday: January 7, 2024
    expect(normalizeDate(result.start)).toEqual(createDate(2024, 0, 1));
    expect(normalizeDate(result.end)).toEqual(createDate(2024, 0, 7));
    expect(result.label).toBe('01.01.2024 – 07.01.2024');
  });
  
  // Test case: Verifies the label format.
  // Business context: Ensures the date range is displayed in a user-friendly and consistent format.
  it('should produce a label in the format "dd.mm.yyyy – dd.mm.yyyy"', () => {
    const date = createDate(2023, 0, 15); // Jan 15, 2023
    vi.setSystemTime(date);
    const result = getWeekRange(0);
    // Regex to check dd.mm.yyyy – dd.mm.yyyy format
    expect(result.label).toMatch(/^\d{2}\.\d{2}\.\d{4} – \d{2}\.\d{2}\.\d{4}$/);
  });
});
