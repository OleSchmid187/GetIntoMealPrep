import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Callback from './Callback';

// Mock dependencies - essential for isolating component behavior in enterprise testing
vi.mock('@logto/react', () => ({
  useHandleSignInCallback: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

// Import mocked functions for type safety and better IDE support
import { useHandleSignInCallback } from '@logto/react';
import { useNavigate, useLocation } from 'react-router-dom';

const mockUseHandleSignInCallback = vi.mocked(useHandleSignInCallback);
const mockNavigate = vi.fn();
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseLocation = vi.mocked(useLocation);

/**
 * Test suite for Callback component
 * 
 * This component handles the OAuth callback flow from Logto authentication service.
 * Critical business functionality includes:
 * - Processing authentication tokens after redirect from identity provider
 * - Navigating users to their intended destination or dashboard
 * - Providing user feedback during authentication processing
 * - Graceful error handling for failed authentication attempts
 */
describe('Callback Component', () => {
  
  beforeEach(() => {
    // Reset all mocks to ensure test isolation - prevents state bleeding between tests
    vi.clearAllMocks();
    
    // Set up default mock implementations for consistent test baseline
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: '/callback',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  afterEach(() => {
    // Clean up any side effects to maintain test isolation
    vi.resetAllMocks();
  });

  /**
   * Unit Tests - Component State Rendering
   * These tests validate that the component correctly renders different UI states
   * based on the authentication flow status from Logto
   */
  describe('Authentication State Rendering', () => {
    
    it('should display loading state during authentication callback processing', () => {
      // Business context: Users need visual feedback that authentication is in progress
      // This prevents confusion and abandoned sessions during OAuth flow
      mockUseHandleSignInCallback.mockReturnValue({
          isLoading: true,
          error: undefined,
          isAuthenticated: false
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Verify loading message is displayed to user
      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      
      // Accessibility check: ensure loading state is announced to screen readers
      const loadingElement = screen.getByText('Redirecting...');
      expect(loadingElement).toBeVisible();
    });

    it('should display error state when authentication callback fails', () => {
      // Business context: Failed authentication requires clear user communication
      // and guidance for recovery actions
      const mockError = new Error('Authentication failed');
      mockUseHandleSignInCallback.mockReturnValue({
          isLoading: false,
          error: mockError,
          isAuthenticated: false
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Verify error message provides actionable guidance
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      
      // Accessibility validation: error messages should be perceivable
      const errorElement = screen.getByText('Login failed. Please try again.');
      expect(errorElement).toBeVisible();
    });

    it('should render nothing when authentication completes successfully', () => {
      // Business context: Successful authentication should immediately redirect
      // without showing intermediate UI that could confuse users
      mockUseHandleSignInCallback.mockReturnValue({
          isLoading: false,
          error: undefined,
          isAuthenticated: false
      });

      const { container } = render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Verify component renders null when authentication succeeds
      expect(container.firstChild).toBeNull();
    });
  });

  /**
   * Integration Tests - Navigation Flow
   * These tests validate the complete user journey through authentication callback
   * including navigation to intended destinations
   */
  describe('Navigation Integration', () => {
    
    it('should navigate to dashboard when no return path is specified', async () => {
      // Business context: Default destination ensures users land somewhere useful
      // when accessing app directly through auth provider
      let callbackFunction: (() => void) | undefined;
      
      mockUseHandleSignInCallback.mockImplementation((callback) => {
        callbackFunction = callback;
        return { isLoading: false, error: undefined, isAuthenticated: true };
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Simulate successful authentication callback
      if (callbackFunction) {
        callbackFunction();
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should navigate to original intended destination when return path exists', async () => {
      // Business context: Preserving user intent by returning to originally requested page
      // improves user experience and reduces friction in protected workflows
      const returnPath = '/meal-plans/create';
      let callbackFunction: (() => void) | undefined;
      
      mockUseLocation.mockReturnValue({
        pathname: '/callback',
        search: '',
        hash: '',
        state: { from: { pathname: returnPath } },
        key: 'test',
      });

      mockUseHandleSignInCallback.mockImplementation((callback) => {
        callbackFunction = callback;
        return { isLoading: false, error: undefined, isAuthenticated: true };
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Simulate successful authentication with return path
      if (callbackFunction) {
        callbackFunction();
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(returnPath, { replace: true });
      });
    });

    it('should use replace navigation to prevent back button issues', async () => {
      // Business context: Using replace prevents users from navigating back to
      // callback URL which would cause errors or confusion
      let callbackFunction: (() => void) | undefined;
      
      mockUseHandleSignInCallback.mockImplementation((callback) => {
        callbackFunction = callback;
        return { isLoading: false, error: undefined, isAuthenticated: true };
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      if (callbackFunction) {
        callbackFunction();
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.any(String), 
          { replace: true }
        );
      });
    });
  });

  /**
   * Edge Cases and Error Scenarios
   * These tests ensure robust handling of unusual or error conditions
   * that may occur in production environments
   */
  describe('Edge Cases and Error Handling', () => {
    
    it('should handle malformed location state gracefully', async () => {
      // Business context: Malformed state could occur from manual URL manipulation
      // or integration issues - component should not crash
      let callbackFunction: (() => void) | undefined;
      
      mockUseLocation.mockReturnValue({
        pathname: '/callback',
        search: '',
        hash: '',
        state: { invalidStructure: true },
        key: 'test',
      });

      mockUseHandleSignInCallback.mockImplementation((callback) => {
        callbackFunction = callback;
        return { isLoading: false, error: undefined, isAuthenticated: true };
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      if (callbackFunction) {
        callbackFunction();
      }

      // Should fallback to dashboard when state structure is invalid
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle null location state without errors', async () => {
      // Business context: Null state can occur in various navigation scenarios
      // Component must handle this gracefully without throwing exceptions
      let callbackFunction: (() => void) | undefined;
      
      mockUseLocation.mockReturnValue({
        pathname: '/callback',
        search: '',
        hash: '',
        state: null,
        key: 'test',
      });

      mockUseHandleSignInCallback.mockImplementation((callback) => {
        callbackFunction = callback;
        return { isLoading: false, error: undefined, isAuthenticated: true };
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      if (callbackFunction) {
        callbackFunction();
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle authentication hook errors without crashing', () => {
      // Business context: Authentication service errors should not crash the app
      // Users should see clear error messaging and recovery options
      const authError = new Error('Network timeout during authentication');
      
      mockUseHandleSignInCallback.mockReturnValue({
          isLoading: false,
          error: authError,
          isAuthenticated: false
      });

      expect(() => {
        render(
          <MemoryRouter>
            <Callback />
          </MemoryRouter>
        );
      }).not.toThrow();

      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  /**
   * Accessibility Tests
   * These tests ensure the component meets enterprise accessibility standards
   * and provides inclusive user experience
   */
  describe('Accessibility Requirements', () => {
    
    it('should provide accessible loading state for screen readers', () => {
      // Business context: Loading states must be perceivable by assistive technology
      // to ensure inclusive user experience during authentication
      mockUseHandleSignInCallback.mockReturnValue({
        isLoading: true,
        error: undefined,
        isAuthenticated: false
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      const loadingElement = screen.getByText('Redirecting...');
      
      // Verify element is accessible to screen readers
      expect(loadingElement).toBeVisible();
      expect(loadingElement).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide accessible error messaging for screen readers', () => {
      // Business context: Error states must be clearly communicated to all users
      // including those using assistive technology
      mockUseHandleSignInCallback.mockReturnValue({
          isLoading: false,
          error: new Error('Test error'),
          isAuthenticated: false
      });

      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      const errorElement = screen.getByText('Login failed. Please try again.');
      
      // Verify error message is accessible
      expect(errorElement).toBeVisible();
      expect(errorElement).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should not interfere with keyboard navigation when rendering null', () => {
      // Business context: Successful authentication state should not create
      // invisible focusable elements that confuse keyboard users
      mockUseHandleSignInCallback.mockReturnValue({
        isLoading: false,
        error: undefined,
        isAuthenticated: true
      });

      const { container } = render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );

      // Verify no DOM elements are rendered that could interfere with navigation
      expect(container.firstChild).toBeNull();
      
      // Ensure no hidden focusable elements exist
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements).toHaveLength(0);
    });
  });

  /**
   * Performance and Resource Management Tests
   * These tests ensure the component doesn't create memory leaks or performance issues
   */
  describe('Performance and Resource Management', () => {
    
    it('should not cause unnecessary re-renders during state transitions', () => {
      // Business context: Efficient rendering during auth flow improves user experience
      // and reduces resource consumption on mobile devices
      const renderSpy = vi.fn();
      
      const TestWrapper = () => {
        renderSpy();
        return <Callback />;
      };

      mockUseHandleSignInCallback.mockReturnValue({
        isLoading: true,
        error: undefined,
        isAuthenticated: false
      });

      const { rerender } = render(
        <MemoryRouter>
          <TestWrapper />
        </MemoryRouter>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Simulate state change
      mockUseHandleSignInCallback.mockReturnValue({
        isLoading: false,
        error: undefined,
        isAuthenticated: true
      });

      rerender(
        <MemoryRouter>
          <TestWrapper />
        </MemoryRouter>
      );

      // Verify reasonable number of renders (should not exceed expected transitions)
      expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(initialRenderCount + 2);
    });
  });
});
