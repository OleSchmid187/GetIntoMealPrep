import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Profil from "./Profil";
import logtoConfig from "../../config/logtoConfig";

// Mock the useLogto hook
const mockSignOut = vi.fn();
vi.mock("@logto/react", () => ({
  useLogto: () => ({
    signOut: mockSignOut,
    isAuthenticated: true, // Assuming user is authenticated to see profile
  }),
}));

// Mock the useProfileData hook
const mockUseProfileData = vi.fn();
vi.mock("../../utils/useProfileData", () => ({
  useProfileData: () => mockUseProfileData(),
}));

// Mock the Button component as it's a custom component and not the focus of these unit tests
vi.mock("../../components/Button/Button", () => ({
  default: ({
    children,
    onClick,
    color,
    size,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    color: string;
    size: string;
  }) => (
    <button onClick={onClick} data-color={color} data-size={size}>
      {children}
    </button>
  ),
}));

describe("Profil Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSignOut.mockClear();
    mockUseProfileData.mockClear();
  });

  // Test case for rendering the loading state
  it("should display loading message when profile data is loading", () => {
    // Arrange: Configure useProfileData mock to return loading state
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: true,
      error: null,
    });

    // Act: Render the Profil component
    render(<Profil />);

    // Assert: Check if the loading message is displayed
    // Business Context: Users should be informed that data is being fetched.
    expect(screen.getByText("Lade Profil...")).toBeInTheDocument();
  });

  // Test case for rendering the error state
  it("should display error message when there is an error fetching profile data", () => {
    // Arrange: Configure useProfileData mock to return error state
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: false,
      error: new Error("Failed to fetch"),
    });

    // Act: Render the Profil component
    render(<Profil />);

    // Assert: Check if the error message is displayed
    // Business Context: Users should be informed if data fetching fails.
    expect(
      screen.getByText("Fehler beim Laden des Profils")
    ).toBeInTheDocument();
  });

  // Test case for rendering the error state when profileData is null after loading
  it("should display error message if profileData is null and not loading", () => {
    // Arrange: Configure useProfileData mock to return null data without error object
    mockUseProfileData.mockReturnValue({
      profileData: null,
      loading: false,
      error: null,
    });

    // Act: Render the Profil component
    render(<Profil />);

    // Assert: Check if the error message is displayed
    // Business Context: Handles edge cases where loading finishes but data is unexpectedly null.
    expect(
      screen.getByText("Fehler beim Laden des Profils")
    ).toBeInTheDocument();
  });

  // Test case for successful rendering of profile data
  it("should display profile information when data is successfully fetched", () => {
    // Arrange: Configure useProfileData mock to return sample profile data
    const sampleProfileData = {
      username: "TestUser",
      email: "test@example.com",
      createdAt: "2023-01-01T12:00:00Z",
    };
    mockUseProfileData.mockReturnValue({
      profileData: sampleProfileData,
      loading: false,
      error: null,
    });

    // Act: Render the Profil component
    const { container } = render(<Profil />);

    // Assert: Check if profile information is displayed correctly
    // Business Context: Core functionality - users must see their profile details.
    expect(screen.getByText("Mein Profil")).toBeInTheDocument(); // Panel header
    expect(screen.getByText(sampleProfileData.username)).toBeInTheDocument();

    // Use a custom matcher or check textContent for elements where text is split
    // For "Email: test@example.com"
    const emailParagraph = screen.getByText("Email:").closest("p");
    expect(emailParagraph).toBeInTheDocument();
    expect(emailParagraph?.textContent).toBe(`Email: ${sampleProfileData.email}`);

    // For "Erstellt am: 2023-01-01T12:00:00Z"
    const createdAtParagraph = screen.getByText("Erstellt am:").closest("p");
    expect(createdAtParagraph).toBeInTheDocument();
    expect(createdAtParagraph?.textContent).toBe(
      `Erstellt am: ${sampleProfileData.createdAt}`
    );

    expect(screen.getByRole("button", { name: "Ausloggen" })).toBeInTheDocument();

    // Accessibility check: Ensure the avatar icon (SVG) is present.
    // The Avatar component renders an SVG icon. We look for the container
    // and then the SVG element within it.
    const avatarContainer = container.querySelector(".profil-avatar-icon");
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer?.querySelector("svg")).toBeInTheDocument();
  });

  // Test case for logout button functionality
  it("should call signOut with correct redirect URI when logout button is clicked", () => {
    // Arrange: Configure useProfileData mock for successful data load
    const sampleProfileData = {
      username: "TestUser",
      email: "test@example.com",
      createdAt: "2023-01-01T12:00:00Z",
    };
    mockUseProfileData.mockReturnValue({
      profileData: sampleProfileData,
      loading: false,
      error: null,
    });

    render(<Profil />);

    // Act: Find and click the logout button
    // User Interaction: Simulates a user clicking the logout button.
    const logoutButton = screen.getByRole("button", { name: "Ausloggen" });
    fireEvent.click(logoutButton);

    // Assert: Check if signOut was called with the configured logoutRedirectUri
    // Business Context: Ensures the logout process initiates correctly.
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith(logtoConfig.logoutRedirectUri);
  });

  // Test case for accessibility of interactive elements
  it("should have accessible names for interactive elements", () => {
    // Arrange: Configure useProfileData mock for successful data load
    const sampleProfileData = {
      username: "TestUser",
      email: "test@example.com",
      createdAt: "2023-01-01T12:00:00Z",
    };
    mockUseProfileData.mockReturnValue({
      profileData: sampleProfileData,
      loading: false,
      error: null,
    });

    render(<Profil />);

    // Act & Assert: Check for accessible name on the logout button
    // Accessibility: Ensures buttons are identifiable by assistive technologies.
    const logoutButton = screen.getByRole("button", { name: "Ausloggen" });
    expect(logoutButton).toBeInTheDocument();

    // Note: More comprehensive accessibility testing would involve tools like axe-core.
    // This test covers a basic but important aspect of a11y.
  });

  // Comment on untested logic:
  // - The actual rendering of the Avatar icon (<FaUserCircle />) is not deeply tested here,
  //   as it's an external component. We trust PrimeReact and react-icons to render correctly.
  // - CSS class applications and styling are not tested, as this is typically out of scope for unit/integration tests
  //   and better covered by visual regression or E2E tests.
  // - The `logtoConfig.logoutRedirectUri` is used directly; its value correctness is assumed to be tested elsewhere or is a configuration concern.
});
