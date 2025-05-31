import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CTASection from "./CTASection";

// Use vi.hoisted for variables accessed by mock factories
const { mockNavigate, mockSignIn, mockUseLogto, testRedirectUri } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockSignIn: vi.fn().mockResolvedValue(undefined), // signIn is async
    mockUseLogto: vi.fn(),
    testRedirectUri: "test-redirect-uri/callback",
  };
});

// Mocking react-router-dom's useNavigate hook
// This allows us to control and spy on navigation calls within the tests.
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any), // Spread actual module to keep other exports
    useNavigate: () => mockNavigate,
  };
});

// Mocking @logto/react's useLogto hook
// This allows us to simulate different authentication states (authenticated/unauthenticated)
// and spy on the signIn function.
vi.mock("@logto/react", () => ({
  useLogto: mockUseLogto,
}));

// Mocking the logtoConfig module
// The component imports this configuration directly, so we mock it to provide
// a controlled redirect URI for testing purposes.
vi.mock("../../../config/logtoConfig", () => ({
  default: {
    redirectUri: testRedirectUri,
  },
}));

describe("CTASection Component", () => {
  beforeEach(() => {
    // Clear mock history before each test to ensure test isolation.
    // This prevents calls from one test affecting assertions in another.
    mockNavigate.mockClear();
    mockSignIn.mockClear(); // Ensure mockSignIn is also cleared
    mockUseLogto.mockClear();
  });

  it("should render correctly with appropriate content when user is not authenticated", () => {
    // Test: Verifies the initial rendering of the CTASection for an unauthenticated user.
    // Context: This is the primary view for new or logged-out users, encouraging them to engage.
    // It checks for the main headline, descriptive text, and the 'Start Now' call-to-action button.
    mockUseLogto.mockReturnValue({
      isAuthenticated: false,
      signIn: mockSignIn, // mockSignIn is correctly referenced from vi.hoisted
      isLoading: false, // Assuming component might check isLoading
    });

    render(
      <MemoryRouter>
        <CTASection />
      </MemoryRouter>
    );

    // Assert: Check for the presence of key textual elements.
    // The heading should invite users to start meal prepping.
    expect(screen.getByRole("heading", { name: /Starte jetzt mit Meal Prep/i })).toBeInTheDocument();
    // The paragraph should provide a brief overview of the benefits.
    expect(screen.getByText(/Einfach, gesund und organisiert – alles an einem Ort./i)).toBeInTheDocument();
    // The button should prompt unauthenticated users to 'Start Now'.
    expect(screen.getByRole("button", { name: /Jetzt starten/i })).toBeInTheDocument();
  });

  it("should call signIn with the configured redirect URI when 'Jetzt starten' button is clicked by an unauthenticated user", async () => {
    // Test: Ensures the sign-in process is initiated when an unauthenticated user clicks the 'Start Now' button.
    // Context: This is a critical user flow for onboarding. The test verifies that the Logto signIn function
    // is called with the correct redirect URI specified in the application's configuration.
    mockUseLogto.mockReturnValue({
      isAuthenticated: false,
      signIn: mockSignIn, // mockSignIn is correctly referenced from vi.hoisted
      isLoading: false,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CTASection />
      </MemoryRouter>
    );

    const startButton = screen.getByRole("button", { name: /Jetzt starten/i });
    await user.click(startButton);

    // Assert: Verify that the signIn function was called exactly once and with the correct parameters.
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(testRedirectUri);
  });

  it("should render correctly with appropriate content when user is authenticated", () => {
    // Test: Verifies the rendering of the CTASection for an authenticated user.
    // Context: For logged-in users, the CTA should guide them towards the application's core features,
    // in this case, navigating to their dashboard.
    mockUseLogto.mockReturnValue({
      isAuthenticated: true,
      signIn: mockSignIn, // mockSignIn is correctly referenced from vi.hoisted
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <CTASection />
      </MemoryRouter>
    );

    // Assert: Check for the presence of key textual elements, adapted for authenticated users.
    // The heading and paragraph remain consistent.
    expect(screen.getByRole("heading", { name: /Starte jetzt mit Meal Prep/i })).toBeInTheDocument();
    expect(screen.getByText(/Einfach, gesund und organisiert – alles an einem Ort./i)).toBeInTheDocument();
    // The button text should change to 'To Dashboard' for authenticated users.
    expect(screen.getByRole("button", { name: /Zum Dashboard/i })).toBeInTheDocument();
  });

  it("should navigate to /dashboard when 'Zum Dashboard' button is clicked by an authenticated user", async () => {
    // Test: Ensures that an authenticated user is navigated to the dashboard upon clicking the 'To Dashboard' button.
    // Context: This is a key navigation path for returning users. The test verifies that the
    // react-router navigation function is called with the correct '/dashboard' path.
    mockUseLogto.mockReturnValue({
      isAuthenticated: true,
      signIn: mockSignIn, // mockSignIn is correctly referenced from vi.hoisted
      isLoading: false,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CTASection />
      </MemoryRouter>
    );

    const dashboardButton = screen.getByRole("button", { name: /Zum Dashboard/i });
    await user.click(dashboardButton);

    // Assert: Verify that the navigate function was called exactly once and with the '/dashboard' path.
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // Accessibility checks can be added here if more specific a11y testing is required.
  // For example, ensuring the section has an accessible name if not implicitly provided by the heading.
  // However, using getByRole with name already provides a good baseline for accessibility.
});
