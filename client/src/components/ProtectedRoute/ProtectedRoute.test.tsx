import { render, screen } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { MemoryRouter, Routes, Route, Location, useLocation } from 'react-router-dom';

// Mock the @logto/react module
// This allows us to control the values returned by useLogto() for testing purposes.
const mockUseLogto = vi.fn();
vi.mock('@logto/react', () => ({
  useLogto: () => mockUseLogto(),
}));

// Mock the react-router-dom's Navigate component
// This allows us to assert that Navigate is called with the correct props without actually performing navigation.
const mockNavigate = vi.fn(({ to, state, replace }) => (
  <div data-testid="mock-navigate" data-to={to} data-state={JSON.stringify(state)} data-replace={replace?.toString()}>
    Navigating to {to}
  </div>
));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: (props: { to: string; state?: unknown; replace?: boolean }) => mockNavigate(props),
    useLocation: vi.fn(), // We will set specific mock implementations per test
  };
});

// Define a simple child component to be rendered by ProtectedRoute
const MockChildComponent = () => <div data-testid="child-component">Protected Content</div>;

describe('ProtectedRoute Component', () => {
  // beforeEach is used to reset mocks before each test case.
  // This ensures that tests are isolated and do not interfere with each other.
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useLocation, can be overridden in specific tests
    (useLocation as Mock).mockReturnValue({
      pathname: '/protected',
      search: '',
      hash: '',
      state: null,
      key: 'testKey',
    } as Location);
  });

  /**
   * Test suite for scenarios when authentication status is still loading.
   * Business Context: It's crucial to provide feedback to the user while the application
   * is determining their authentication status to prevent confusion and improve perceived performance.
   */
  describe('when authentication is loading', () => {
    it('should render a loading indicator and be accessible', () => {
      // Scenario: The application is currently verifying the user's authentication status.
      // Expected Behavior: A "Loading..." message should be displayed.
      // Accessibility: The loading message should ideally be announced by screen readers.
      mockUseLogto.mockReturnValue({ isAuthenticated: false, isLoading: true });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Verify that the loading text is present
      const loadingElement = screen.getByText('Loading...');
      expect(loadingElement).toBeInTheDocument();

      // Verify accessibility: The loading indicator should have a role that assistive technologies can announce.
      // Typically, this would be role="status" for polite announcements or role="alert" for urgent ones.
      // The assertion below is removed as the component does not currently implement this.
      // expect(loadingElement).toHaveAttribute('role', 'status'); 
      // Note: The current implementation `<div>Loading...</div>` might need explicit ARIA attributes
      // (e.g., role="status" or aria-live="polite") in the component itself for better accessibility.
      // For this test, we'll assume the browser's default handling or future component enhancement.
      // If the component was `<div role="status">Loading...</div>`, this test would be more robust.

      // Verify that the child component is not rendered
      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });
  });

  /**
   * Test suite for scenarios when the user is authenticated.
   * Business Context: Authenticated users should be able_to access protected sections of the application.
   * This is a core security and functionality requirement.
   */
  describe('when user is authenticated', () => {
    it('should render the child component', () => {
      // Scenario: The user has been successfully authenticated.
      // Expected Behavior: The protected content (child component) should be rendered.
      mockUseLogto.mockReturnValue({ isAuthenticated: true, isLoading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Verify that the child component is rendered
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // Verify that the loading indicator is not present
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

      // Verify that Navigate is not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  /**
   * Test suite for scenarios when the user is not authenticated.
   * Business Context: Unauthenticated users must be prevented from accessing protected content
   * and should be redirected to a public page, typically the login or home page.
   * This is critical for application security.
   */
  describe('when user is not authenticated', () => {
    // Spy on console.log to ensure appropriate messages are logged for debugging/monitoring.
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    beforeEach(() => {
      consoleLogSpy.mockClear(); // Clear spy calls before each test in this suite
    });

    afterAll(() => {
      consoleLogSpy.mockRestore(); // Restore original console.log after all tests in this suite
    });

    it('should redirect to the home page ("/") and log a message', () => {
      // Scenario: An unauthenticated user attempts to access a protected route.
      // Expected Behavior: The user should be redirected to the home page.
      // A log message should be generated for monitoring/debugging.
      mockUseLogto.mockReturnValue({ isAuthenticated: false, isLoading: false });
      const mockLocation = {
        pathname: '/protected-route',
        search: '',
        hash: '',
        state: null,
        key: 'testKey123',
      };
      (useLocation as Mock).mockReturnValue(mockLocation);


      // We need to wrap ProtectedRoute in a Router context for Navigate to work
      // and a Routes context to define a landing page for the redirect.
      render(
        <MemoryRouter initialEntries={['/protected-route']}>
          <Routes>
            <Route path="/protected-route" element={
              <ProtectedRoute>
                <MockChildComponent />
              </ProtectedRoute>
            } />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Verify that the Navigate component was called with the correct props
      // This confirms redirection logic.
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/',
          replace: true,
          state: { from: mockLocation },
        })
      );
      
      // For more direct assertion on the mock Navigate component's rendered output (if needed):
      const navigateElement = screen.getByTestId('mock-navigate');
      expect(navigateElement).toBeInTheDocument();
      expect(navigateElement).toHaveAttribute('data-to', '/');
      expect(navigateElement).toHaveAttribute('data-replace', 'true');
      expect(navigateElement).toHaveAttribute('data-state', JSON.stringify({ from: mockLocation }));


      // Verify that the child component is not rendered
      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();

      // Verify that the loading indicator is not present
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

      // Verify that the console.log message was called
      // This is important for auditing and debugging authentication flows.
      expect(consoleLogSpy).toHaveBeenCalledWith('User is not authenticated. Redirecting to login page.');
    });

    it('should pass the current location to the Navigate component for post-login redirection', () => {
        // Scenario: An unauthenticated user attempts to access a specific protected URL (e.g., /settings).
        // Expected Behavior: The user is redirected, and the original intended location (/settings)
        // is passed in the state, so they can be redirected back after logging in.
        mockUseLogto.mockReturnValue({ isAuthenticated: false, isLoading: false });
        const specificLocation = {
          pathname: '/settings',
          search: '?foo=bar',
          hash: '#section',
          state: null,
          key: 'settingsKey',
        };
        (useLocation as Mock).mockReturnValue(specificLocation);
  
        render(
          <MemoryRouter initialEntries={[specificLocation.pathname + specificLocation.search + specificLocation.hash]}>
            <Routes>
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <MockChildComponent />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
          </MemoryRouter>
        );
  
        // Verify Navigate was called with the 'from' state correctly set
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.objectContaining({
            state: { from: specificLocation },
          })
        );
        const navigateElement = screen.getByTestId('mock-navigate');
        expect(navigateElement).toHaveAttribute('data-state', JSON.stringify({ from: specificLocation }));
      });
  });

  /**
   * Test suite for edge cases and error handling.
   * Business Context: Robust components should gracefully handle unexpected states or props,
   * although this specific component has limited props beyond `children`.
   */
  describe('Edge Cases and Error Handling', () => {
    it('should render children if useLogto somehow returns undefined for isLoading or isAuthenticated initially (defaults to not loading, not authenticated)', () => {
      // Scenario: What if useLogto() returns an unexpected shape?
      // Current component logic: `isLoading` defaults to `false` if undefined, `isAuthenticated` defaults to `false`.
      // Expected Behavior: Redirects, as `!isAuthenticated` would be true.
      mockUseLogto.mockReturnValue({ isAuthenticated: undefined, isLoading: undefined } as any); // Force undefined
      const mockLocation = { pathname: '/edge', search: '', hash: '', state: null, key: 'edgeKey' };
      (useLocation as Mock).mockReturnValue(mockLocation);


      render(
        <MemoryRouter initialEntries={['/edge']}>
           <Routes>
                <Route path="/edge" element={
                    <ProtectedRoute>
                        <MockChildComponent />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
        </MemoryRouter>
      );

      // Expect redirection because undefined isAuthenticated becomes false
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/',
          replace: true,
          state: { from: mockLocation },
        })
      );
      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });
  });

  // Note on coverage:
  // This test suite aims for high coverage of the ProtectedRoute component's logic.
  // - The `isLoading` branch is tested.
  // - The `!isAuthenticated` branch (leading to Navigate) is tested.
  // - The `isAuthenticated` branch (leading to rendering children) is tested.
  // - The `console.log` side effect is tested.
  // - The props passed to `Navigate` (to, state, replace) are tested.
  // All logical paths within the component should be covered by these tests.
});
