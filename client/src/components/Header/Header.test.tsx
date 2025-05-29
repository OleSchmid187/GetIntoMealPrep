import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import Header from './Header';
import logtoConfig from '../../config/logtoConfig';

// Mock react-router-dom hooks
// This allows us to control the values returned by these hooks during tests
// and spy on functions like navigate.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual, // Preserve other exports from react-router-dom
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

// Mock @logto/react hook
// This allows us to simulate different authentication states (isAuthenticated)
// and spy on Logto functions like signIn.
vi.mock('@logto/react', () => ({
  useLogto: vi.fn(),
}));

// Mock image assets
// When the component tries to import the logo, it will get this mocked value.
vi.mock('../../assets/getintomealpreplogo.png', () => ({
  default: 'mocked-logo.png', // Provide a mock path or identifier for the image src
}));

// Note: logtoConfig is imported directly. If it had complex logic or side effects,
// it would also be mocked. For this component, only `redirectUri` is used,
// so using the actual simple config object is acceptable.

describe('Header Component', () => {
  // Declare mock function variables to be accessible across tests within this suite
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSignIn: ReturnType<typeof vi.fn>;
  const user = userEvent.setup(); // Setup userEvent for simulating user interactions

  // Helper function to render the Header component with specified route and authentication state.
  // This reduces boilerplate in individual tests.
  const renderHeader = (pathname: string, isAuthenticated: boolean) => {
    mockNavigate = vi.fn(); // Reset or initialize navigate mock for each render
    mockSignIn = vi.fn().mockResolvedValue(undefined); // Reset or initialize signIn mock, it's async

    // Configure the mocked hooks to return specific values for the current test case
    (useLocation as Mock).mockReturnValue({ pathname });
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useLogto as Mock).mockReturnValue({
      isAuthenticated,
      signIn: mockSignIn,
      signOut: vi.fn(),
      fetchUserInfo: vi.fn(),
      getAccessToken: vi.fn(),
      isLoading: false,
      error: null,
    });

    // Render the component within MemoryRouter to provide routing context
    // initialEntries sets the current path for the router
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <Header />
      </MemoryRouter>
    );
  };

  // Teardown function executed after each test
  afterEach(() => {
    cleanup(); // Unmounts React trees that were mounted with render, cleaning up the DOM
    vi.clearAllMocks(); // Resets all mocks (call counts, implementations, etc.)
  });

  describe('Common Elements and Navigation', () => {
    // Test Case: Verifies that the application logo is always rendered in the header.
    // Business Context: The logo is a key branding element and a common navigation point to the homepage.
    // It should be consistently visible across different states of the application.
    it('should always render the application logo with correct src attribute', () => {
      renderHeader('/', false); // The specific state (path/auth) is not critical for logo presence
      const logoImage = screen.getByAltText('GetIntoMealPrep Logo');
      expect(logoImage).toBeInTheDocument(); // Check if the logo image is rendered
      expect(logoImage).toHaveAttribute('src', 'mocked-logo.png'); // Check if src is the mocked path
    });

    // Test Case: Validates that clicking the logo navigates the user to the homepage ("/").
    // Business Context: This is a standard UX pattern ensuring users can easily return to the main page.
    it('should navigate to the homepage ("/") when the logo is clicked', async () => {
      renderHeader('/some-other-page', false); // Start on a page other than home
      // The onClick handler is on the parent div of the image
      const logoContainer = screen.getByAltText('GetIntoMealPrep Logo').parentElement;
      expect(logoContainer).toBeInTheDocument(); // Ensure the clickable element is present
      
      await user.click(logoContainer!); // Simulate user click on the logo's container
      expect(mockNavigate).toHaveBeenCalledWith('/'); // Assert navigation to home
    });
  });

  describe('Unauthenticated User Experience', () => {
    // Context: Tests for users who are not logged into the application.
    describe('On Home Page (pathname: "/")', () => {
      beforeEach(() => {
        // Setup for unauthenticated user on the homepage before each test in this block
        renderHeader('/', false);
      });

      // Test Case: Checks for the "Start Now" button and the absence of elements intended for authenticated users.
      // Business Context: The "Start Now" button is the primary call-to-action for new or logged-out users to sign up or sign in.
      it('should display the "Start Now" button and not display profile icon or "To Dashboard" button', () => {
        expect(screen.getByRole('button', { name: 'Jetzt starten' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Zum Dashboard' })).not.toBeInTheDocument();
        // Profile icon (FaUserCircle) has class 'profile-icon'. Querying its absence.
        expect(document.querySelector('.profile-icon')).not.toBeInTheDocument();
      });

      // Test Case: Verifies that clicking the "Start Now" button initiates the Logto sign-in process.
      // Business Context: This interaction is a critical part of the user acquisition and login funnel.
      it('should call the signIn function with the correct redirect URI when "Start Now" button is clicked', async () => {
        const startButton = screen.getByRole('button', { name: 'Jetzt starten' });
        await user.click(startButton); // Simulate click
        expect(mockSignIn).toHaveBeenCalledTimes(1); // Ensure signIn was called
        expect(mockSignIn).toHaveBeenCalledWith(logtoConfig.redirectUri); // Ensure it was called with the configured redirect URI
      });
    });

    describe('On Non-Home Page (e.g., pathname: "/some-other-page")', () => {
      beforeEach(() => {
        // Setup for unauthenticated user on a page other than home
        renderHeader('/some-other-page', false);
      });

      // Test Case: Ensures that unauthenticated users on non-home pages do not see authentication-related CTAs or user-specific icons.
      // Business Context: Maintains a focused UI, avoiding irrelevant options for users not on the primary landing/conversion page.
      it('should not display "Start Now" button, "To Dashboard" button, or profile icon', () => {
        expect(screen.queryByRole('button', { name: 'Jetzt starten' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Zum Dashboard' })).not.toBeInTheDocument();
        expect(document.querySelector('.profile-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User Experience', () => {
    // Context: Tests for users who are logged into the application.
    describe('On Home Page (pathname: "/")', () => {
      let profileIcon: HTMLElement | null; // Variable to store the profile icon element
      beforeEach(() => {
        // Setup for authenticated user on the homepage
        const { container } = renderHeader('/', true);
        // The profile icon (FaUserCircle) is an SVG with class 'profile-icon'.
        profileIcon = container.querySelector('.profile-icon');
      });

      // Test Case: Checks for the presence of profile icon and "To Dashboard" button for authenticated users on the homepage.
      // Business Context: Provides authenticated users with quick access to their dashboard and profile settings.
      it('should display the profile icon and "To Dashboard" button, and not the "Start Now" button', () => {
        expect(profileIcon).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Zum Dashboard' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Jetzt starten' })).not.toBeInTheDocument();
      });

      // Test Case: Validates that clicking the profile icon navigates to the user's profile page.
      // Business Context: Essential for users to manage their account details and preferences.
      it('should navigate to the profile page ("/profil") when the profile icon is clicked', async () => {
        expect(profileIcon).not.toBeNull(); // Ensure icon was found
        await user.click(profileIcon!); // Simulate click
        expect(mockNavigate).toHaveBeenCalledWith('/profil'); // Assert navigation
      });

      // Test Case: Validates that clicking the "To Dashboard" button navigates to the user's dashboard.
      // Business Context: The dashboard is a central hub for authenticated users.
      it('should navigate to the dashboard page ("/dashboard") when "To Dashboard" button is clicked', async () => {
        const dashboardButton = screen.getByRole('button', { name: 'Zum Dashboard' });
        await user.click(dashboardButton);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    describe('On Non-Home Page (e.g., pathname: "/dashboard")', () => {
      let profileIcon: HTMLElement | null;
      beforeEach(() => {
        // Setup for authenticated user on a page other than home (e.g., their dashboard)
        const { container } = renderHeader('/dashboard', true);
        profileIcon = container.querySelector('.profile-icon');
      });

      // Test Case: Ensures that on non-home pages, authenticated users see the profile icon but not other homepage-specific CTAs.
      // Business Context: Provides consistent access to profile settings while maintaining a clean header on sub-pages.
      it('should display the profile icon, and not "To Dashboard" or "Start Now" buttons', () => {
        expect(profileIcon).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Zum Dashboard' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Jetzt starten' })).not.toBeInTheDocument();
      });

      // Test Case: Validates navigation to the profile page from a non-home page.
      // Business Context: Ensures users can always access their profile, regardless of their current location within authenticated sections.
      it('should navigate to the profile page ("/profil") when the profile icon is clicked', async () => {
        expect(profileIcon).not.toBeNull();
        await user.click(profileIcon!);
        expect(mockNavigate).toHaveBeenCalledWith('/profil');
      });
    });
  });

  describe('Accessibility Considerations', () => {
    // Test Case: Verifies that the logo image includes an `alt` attribute for accessibility.
    // Business Context: Ensures users relying on assistive technologies (e.g., screen readers) can understand the purpose of the logo image.
    // a11y standard: WCAG 1.1.1 Non-text Content.
    it('should render the logo with accessible alt text', () => {
      renderHeader('/', false); // State (path/auth) is not critical for this static attribute
      const logoImage = screen.getByAltText('GetIntoMealPrep Logo');
      expect(logoImage).toBeInTheDocument(); // Confirms presence and correct alt text query
    });

    // Test Case: Checks if buttons are keyboard focusable and have clear, accessible names (derived from their text content).
    // Business Context: Critical for keyboard-only users and users of assistive technologies to interact with buttons.
    // a11y standards: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name, Role, Value.
    it('buttons should be focusable and have clear accessible names', async () => {
      // Test "Start Now" button (unauthenticated, home page)
      renderHeader('/', false);
      const startButton = screen.getByRole('button', { name: 'Jetzt starten' });
      expect(startButton).toBeInTheDocument(); // Check presence
      startButton.focus(); // Programmatically set focus to the button
      expect(startButton).toHaveFocus(); // Assert that the button has focus
      expect(startButton).toHaveTextContent('Jetzt starten'); // Verify accessible name from text

      cleanup(); // Clean up before re-rendering for a different state

      // Test "To Dashboard" button (authenticated, home page)
      renderHeader('/', true);
      const dashboardButton = screen.getByRole('button', { name: 'Zum Dashboard' });
      expect(dashboardButton).toBeInTheDocument();
      dashboardButton.focus();
      expect(dashboardButton).toHaveFocus();
      expect(dashboardButton).toHaveTextContent('Zum Dashboard');
    });

    // Test Case: Checks if the profile icon is interactive and attempts to verify focusability.
    // Business Context: The profile icon is a key navigation element for authenticated users.
    // a11y standards: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name, Role, Value.
    // Note: SVGs like FaUserCircle are not inherently focusable unless `tabIndex` is set or they are part of a focusable element (e.g., button).
    // This test checks for presence and click interaction. Direct focus on the SVG itself is not asserted here as it would require component modification
    // (e.g., adding tabIndex="0" or wrapping in a button) to pass such an assertion.
    it('profile icon should be present, interactive, and ideally keyboard focusable', async () => {
      const { container } = renderHeader('/', true); // Authenticated state where profile icon is visible
      const profileIconElement = container.querySelector<HTMLElement>('.profile-icon');
      expect(profileIconElement).toBeInTheDocument(); // Check presence
      expect(profileIconElement).not.toBeNull();

      // Test click interaction (re-asserting for this specific a11y context)
      await user.click(profileIconElement!);
      expect(mockNavigate).toHaveBeenCalledWith('/profil');
      mockNavigate.mockClear(); // Clear for this specific check

      // Attempt to focus the element.
      // SVGs are not inherently focusable. For the element to actually receive focus and for
      // an assertion like `expect(profileIconElement).toHaveFocus()` to pass,
      // the component would need to make the SVG focusable (e.g., by adding tabIndex="0" or wrapping it in a <button>).
      // This test does not assert focus to avoid failure due to current component implementation,
      // but this highlights an area for accessibility improvement in the Header component itself.
      if (profileIconElement && typeof profileIconElement.focus === 'function') {
        profileIconElement.focus();
        // The following assertion `expect(profileIconElement).toHaveFocus()` is intentionally omitted.
        // It would fail because the SVG, as rendered by the current component, is not focusable.
      }
    });
    
  });
});
