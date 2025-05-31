import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeekSwitcher from './WeekSwitcher';
import { getWeekRange } from '../../../utils/dateUtils';

// Mock the dateUtils module
vi.mock('../../../utils/dateUtils', () => ({
  getWeekRange: vi.fn(),
}));

// Cast the mocked function to its Vitest mock type for type safety
const mockedGetWeekRange = getWeekRange as vi.MockedFunction<typeof getWeekRange>;

describe('WeekSwitcher Component', () => {
  let mockSetWeekOffset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    mockSetWeekOffset = vi.fn();
    mockedGetWeekRange.mockReset();
  });

  // Test 1: Initial rendering for the current week (offset 0)
  // This test verifies that the component correctly displays information
  // for the current week when no offset is applied.
  it('should render correctly for the current week (offset 0)', () => {
    // Specific mock for this test case
    mockedGetWeekRange.mockReturnValue({ label: 'January 1 - January 7' });

    render(<WeekSwitcher weekOffset={0} setWeekOffset={mockSetWeekOffset} />);

    // Check for "Woche aktuell" text
    expect(screen.getByText(/Woche aktuell/i)).toBeInTheDocument();
    // Check for the mocked date range
    expect(screen.getByText(/January 1 - January 7/i)).toBeInTheDocument();
    // Check for "Zurück" (Previous) button
    expect(screen.getByRole('button', { name: /Zurück/i })).toBeInTheDocument();
    // Check for "Weiter" (Next) button
    expect(screen.getByRole('button', { name: /Weiter/i })).toBeInTheDocument();
  });

  // Test 2: Rendering for a future week (positive offset)
  // This test ensures the component displays the correct week information
  // when a positive offset is provided, indicating a future week.
  it('should render correctly for a future week (e.g., offset +2)', () => {
    const weekOffset = 2;
    mockedGetWeekRange.mockReturnValue({ label: 'January 15 - January 21' });

    render(<WeekSwitcher weekOffset={weekOffset} setWeekOffset={mockSetWeekOffset} />);

    // Check for "Woche +2" text using a regex to match part of the span's content
    // The '+' needs to be escaped in the regex pattern.
    expect(screen.getByText(new RegExp(`Woche \\+${weekOffset}`))).toBeInTheDocument();
    // Check for the mocked date range for the future week
    expect(screen.getByText(/January 15 - January 21/i)).toBeInTheDocument();
  });

  // Test 3: Rendering for a past week (negative offset)
  // This test ensures the component displays the correct week information
  // when a negative offset is provided, indicating a past week.
  it('should render correctly for a past week (e.g., offset -1)', () => {
    const weekOffset = -1;
    mockedGetWeekRange.mockReturnValue({ label: 'December 25 - December 31' });

    render(<WeekSwitcher weekOffset={weekOffset} setWeekOffset={mockSetWeekOffset} />);

    // Check for "Woche -1" text using a regex to match part of the span's content
    // The '-' does not strictly need escaping here but can be for clarity if preferred.
    expect(screen.getByText(new RegExp(`Woche ${weekOffset}`))).toBeInTheDocument();
    // Check for the mocked date range for the past week
    expect(screen.getByText(/December 25 - December 31/i)).toBeInTheDocument();
  });

  // Test 4: "Previous" button functionality
  // This test verifies that clicking the "Previous" button calls the
  // setWeekOffset function with the decremented week offset.
  it('should call setWeekOffset with decremented value when "Previous" button is clicked', async () => {
    const user = userEvent.setup();
    const initialOffset = 1;
    mockedGetWeekRange.mockReturnValue({ label: 'Any Date Range' }); // Content doesn't matter for this interaction test

    render(<WeekSwitcher weekOffset={initialOffset} setWeekOffset={mockSetWeekOffset} />);

    const previousButton = screen.getByRole('button', { name: /Zurück/i });
    await user.click(previousButton);

    // Expect setWeekOffset to have been called once
    expect(mockSetWeekOffset).toHaveBeenCalledTimes(1);
    // Expect setWeekOffset to have been called with the new offset (initialOffset - 1)
    expect(mockSetWeekOffset).toHaveBeenCalledWith(initialOffset - 1);
  });

  // Test 5: "Next" button functionality
  // This test verifies that clicking the "Next" button calls the
  // setWeekOffset function with the incremented week offset.
  it('should call setWeekOffset with incremented value when "Next" button is clicked', async () => {
    const user = userEvent.setup();
    const initialOffset = 1;
    mockedGetWeekRange.mockReturnValue({ label: 'Any Date Range' }); // Content doesn't matter for this interaction test

    render(<WeekSwitcher weekOffset={initialOffset} setWeekOffset={mockSetWeekOffset} />);

    const nextButton = screen.getByRole('button', { name: /Weiter/i });
    await user.click(nextButton);

    // Expect setWeekOffset to have been called once
    expect(mockSetWeekOffset).toHaveBeenCalledTimes(1);
    // Expect setWeekOffset to have been called with the new offset (initialOffset + 1)
    expect(mockSetWeekOffset).toHaveBeenCalledWith(initialOffset + 1);
  });

  // Test 6: Accessibility of buttons
  // This test ensures that the navigation buttons are accessible,
  // primarily by checking they have accessible names (derived from their text content).
  it('should have accessible buttons', () => {
    mockedGetWeekRange.mockReturnValue({ label: 'Accessibility Test Range' });
    render(<WeekSwitcher weekOffset={0} setWeekOffset={mockSetWeekOffset} />);

    const previousButton = screen.getByRole('button', { name: /Zurück/i });
    const nextButton = screen.getByRole('button', { name: /Weiter/i });

    // Basic accessibility check: buttons should be in the document and have accessible names.
    // More advanced a11y checks could be done with axe-core if needed.
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  // Test 7: Correctly calls getWeekRange with the current offset
  // This test verifies that the getWeekRange utility is invoked with the
  // appropriate weekOffset prop value during rendering.
  it('should call getWeekRange with the correct weekOffset', () => {
    const testOffset = 5;
    mockedGetWeekRange.mockReturnValue({ label: 'Offset Test Range' });

    render(<WeekSwitcher weekOffset={testOffset} setWeekOffset={mockSetWeekOffset} />);

    // Verify getWeekRange was called with the provided offset
    expect(mockedGetWeekRange).toHaveBeenCalledTimes(1);
    expect(mockedGetWeekRange).toHaveBeenCalledWith(testOffset);
  });
});
