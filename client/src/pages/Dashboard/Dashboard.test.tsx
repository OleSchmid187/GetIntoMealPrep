import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, MockedFunction } from "vitest";
import Dashboard from "./Dashboard";
import { useProfileData } from "../../utils/useProfileData";

// Mock the useProfileData hook
vi.mock("../../utils/useProfileData");

// Mock child components to isolate Dashboard component's functionality
vi.mock("./DashboardPanel/DashboardPanel", () => ({
  default: () => <div data-testid="dashboard-panel">DashboardPanel</div>,
}));

vi.mock("./RecipeSuggestions/RecipeSuggestions", () => ({
  default: () => <div data-testid="recipe-suggestions">RecipeSuggestions</div>,
}));

describe("Dashboard Component", () => {
  // Type assertion for the mocked hook
  const mockUseProfileData = useProfileData as MockedFunction<typeof useProfileData>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  // Test Case 1: Loading State
  // This test verifies that the Dashboard component correctly displays a loading message
  // when the profile data is being fetched. This is crucial for user experience,
  // providing feedback during data retrieval.
  it("should render loading state initially", () => {
    // Arrange: Simulate loading state from the hook
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: true,
      error: null,
    });

    // Act: Render the Dashboard component
    render(<Dashboard />);

    // Assert: Check if the loading message is displayed
    expect(screen.getByText("Lade Benutzerdaten...")).toBeInTheDocument();
    // Assert: Ensure child components are not rendered during loading
    expect(screen.queryByTestId("dashboard-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("recipe-suggestions")).not.toBeInTheDocument();
  });

  // Test Case 2: Error State
  // This test ensures that an error message is shown if fetching profile data fails.
  // Proper error handling is important for informing the user about issues.
  it("should render error message when data fetching fails", () => {
    // Arrange: Simulate error state from the hook
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: false,
      error: new Error("Failed to fetch"),
    });

    // Act: Render the Dashboard component
    render(<Dashboard />);

    // Assert: Check if the error message is displayed
    expect(screen.getByText("Fehler beim Laden der Benutzerdaten")).toBeInTheDocument();
    // Assert: Ensure child components are not rendered on error
    expect(screen.queryByTestId("dashboard-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("recipe-suggestions")).not.toBeInTheDocument();
  });

  // Test Case 3: Error State when profileData is null even without an explicit error object
  // This test covers an edge case where loading is complete, no explicit error object is present,
  // but profileData is still null. This scenario should also be treated as an error.
  it("should render error message if profileData is null and not loading", () => {
    // Arrange: Simulate state where loading is false, no error object, but profileData is null
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: false,
      error: null,
    });

    // Act: Render the Dashboard component
    render(<Dashboard />);

    // Assert: Check if the error message is displayed
    expect(screen.getByText("Fehler beim Laden der Benutzerdaten")).toBeInTheDocument();
  });

  // Test Case 4: Successful Data Loading and Rendering
  // This test verifies that when profile data is successfully fetched, the Dashboard
  // displays the personalized greeting and renders its main child components
  // (DashboardPanel and RecipeSuggestions). This is the primary success scenario.
  it("should render dashboard with user data and child components on successful fetch", () => {
    // Arrange: Simulate successful data fetch from the hook
    const mockProfile = {
      username: "TestUser",
      email: "test@example.com",
      createdAt: "01.01.2023 10:00:00",
    };
    mockUseProfileData.mockReturnValue({
      profileData: mockProfile,
      loading: false,
      error: null,
    });

    // Act: Render the Dashboard component
    render(<Dashboard />);

    // Assert: Check for the personalized greeting message
    expect(screen.getByText(`Hallo, ${mockProfile.username} 👋`)).toBeInTheDocument();

    // Assert: Check if the child components are rendered
    expect(screen.getByTestId("dashboard-panel")).toBeInTheDocument();
    expect(screen.getByTestId("recipe-suggestions")).toBeInTheDocument();

    // Assert: Ensure loading and error messages are not present
    expect(screen.queryByText("Lade Benutzerdaten...")).not.toBeInTheDocument();
    expect(screen.queryByText("Fehler beim Laden der Benutzerdaten")).not.toBeInTheDocument();
  });

  // Test Case 5: Rendering with default username if username is null in profileData
  // This test handles a scenario where profileData is fetched, but the username field might be null.
  // The useProfileData hook itself provides a default "Kein Name", so we test if Dashboard handles it.
  // Note: The current implementation of useProfileData ensures username is never null (defaults to "Kein Name").
  // This test is more of a safeguard or for if that hook's behavior changes.
  // If profileData.username could truly be null and passed to Dashboard, Dashboard would need to handle it.
  // As it stands, useProfileData ensures `username` is a string.
  it("should render dashboard with a fallback greeting if username is not available as expected by useProfileData", () => {
    // Arrange: Simulate profile data where username might be processed to a default by the hook
    const mockProfileWithDefaultUsername = {
      username: "Kein Name", // This is the default from useProfileData if original username is null
      email: "test@example.com",
      createdAt: "01.01.2023 10:00:00",
    };
    mockUseProfileData.mockReturnValue({
      profileData: mockProfileWithDefaultUsername,
      loading: false,
      error: null,
    });

    // Act: Render the Dashboard component
    render(<Dashboard />);

    // Assert: Check for the greeting message with the default username
    expect(screen.getByText(`Hallo, ${mockProfileWithDefaultUsername.username} 👋`)).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-panel")).toBeInTheDocument();
    expect(screen.getByTestId("recipe-suggestions")).toBeInTheDocument();
  });

  // Note on coverage:
  // The tests cover the main conditional rendering paths of the Dashboard component:
  // 1. Loading state.
  // 2. Error state (both explicit error and null profileData after loading).
  // 3. Success state with user data.
  // The internal logic of `DashboardPanel` and `RecipeSuggestions` is not tested here,
  // as they are mocked and should have their own dedicated tests.
  // The interaction with `useProfileData` is fully covered by mocking its return values.
  // No user interactions are directly handled by the Dashboard component itself,
  // its role is primarily to orchestrate data fetching and display based on state.
});
