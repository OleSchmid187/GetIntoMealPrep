import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // MemoryRouter will be used by tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App'; // The component to test
import { useLogto } from '@logto/react'; // Import useLogto to later alias its mocked version
import type { LogtoConfig } from '@logto/react'; // Import type for config

// Mock react-router-dom to replace BrowserRouter
// This prevents the "cannot render a <Router> inside another <Router>" error
// by ensuring App.tsx's internal Router (BrowserRouter) does nothing,
// while the MemoryRouter in renderApp provides the context.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    // Override BrowserRouter to be a simple fragment.
    // App.tsx uses 'BrowserRouter as Router'.
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Hoist all variables that are used inside vi.mock factory functions
const { mockActualLogtoProvider, hoistedMockUseLogtoImpl, actualMockLogtoConfigObject } = vi.hoisted(() => {
  // This object simulates the structure of your actual logtoConfig.
  const config: LogtoConfig = {
    appId: 'test-app-id',
    endpoint: 'https://test.logto.app',
    // Ensure this mock includes all properties your LogtoProvider expects from the config.
    // For example, if you use resources or scopes:
    // resources: ['https://api.example.com'],
    // scopes: ['openid', 'profile', 'offline_access', 'email'],
  };
  return {
    mockActualLogtoProvider: vi.fn(({ children }: { children: React.ReactNode; config: LogtoConfig }) => <>{children}</>),
    hoistedMockUseLogtoImpl: vi.fn(), // This is the vi.fn() that will implement the mocked useLogto
    actualMockLogtoConfigObject: config, // Hoisted config object
  };
});

// Mock configuration that App.tsx imports
vi.mock('./config/logtoConfig', () => ({
  default: actualMockLogtoConfigObject, // Use the hoisted config object
}));

// Mock @logto/react
// mockActualLogtoProvider allows us to spy on the props passed to LogtoProvider.
vi.mock('@logto/react', async () => {
  const actual = await vi.importActual('@logto/react'); // Import actual to get LogtoConfig type etc.
  return {
    ...actual, // Spread actual to keep other exports like LogtoConfig type
    LogtoProvider: mockActualLogtoProvider, // Use the hoisted mock function
    useLogto: hoistedMockUseLogtoImpl, // Use the hoisted mock function for useLogto
  };
});

// Mock page components to simplify tests and focus on App's routing logic.
// Each mock renders a simple div with a unique text identifier.
vi.mock('./pages/Home/Home', () => ({ default: () => <div>HomePageMock</div> }));
vi.mock('./pages/Dashboard/Dashboard', () => ({ default: () => <div>DashboardPageMock</div> }));
vi.mock('./pages/AllRecipes/AllRecipes', () => {
  // console.log('[DEBUG] Mocking AllRecipes component in App.test.tsx'); // Add this for debugging if needed
  return { default: () => <div>AllRecipesPageMock</div> };
});
vi.mock('./pages/Recipes/RecipeDetails/RecipeDetails', () => ({ default: () => <div>RecipeDetailsPageMock</div> }));
vi.mock('./components/Callback/Callback', () => ({ default: () => <div>CallbackPageMock</div> }));
vi.mock('./pages/Profil/Profil', () => ({ default: () => <div>ProfilPageMock</div> }));
vi.mock('./pages/Planner/Planner', () => ({ default: () => <div>PlannerPageMock</div> }));
vi.mock('./pages/MyRecipes/MyRecipes', () => ({ default: () => <div>MyRecipesPageMock</div> }));

// Mock common layout components (Header, Footer)
vi.mock('./components/Header/Header', () => ({ default: () => <div>HeaderMock</div> }));
vi.mock('./components/Footer/Footer', () => ({ default: () => <div>FooterMock</div> }));

// Type assertion for the mocked useLogto hook
// After the mock above, 'useLogto' imported from '@logto/react' will be 'hoistedMockUseLogtoImpl'.
const mockedUseLogto = useLogto as vi.Mock;

describe('App Component: Core Functionality and Routing', () => {
  // Helper function to render the App component within a MemoryRouter for testing routes.
  // Takes an optional initial route string.
  const renderApp = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}> {/* This MemoryRouter will provide the context */}
        <App />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation.
    mockedUseLogto.mockReset(); 
    mockActualLogtoProvider.mockClear();

    // Provide a default mock implementation for useLogto.
    mockedUseLogto.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessToken: vi.fn().mockResolvedValue('fake-token'),
      getIdToken: vi.fn().mockResolvedValue('fake-id-token'), 
      user: null, 
      signIn: vi.fn(),
      signOut: vi.fn(),
      fetchUserInfo: vi.fn().mockResolvedValue(null), 
    });
  });

  afterEach(() => {
    // Clear all mocks after each test to clean up the testing environment.
    vi.clearAllMocks();
  });

  describe('General Rendering and Context Provider Setup', () => {
    it('should render the App component without crashing', () => {
      // Test Case: Verifies that the App component mounts successfully with its core providers.
      // Business Context: Ensures the fundamental application shell is operational.
      // Why: A crashing App component would mean the entire application is down.
      expect(() => renderApp()).not.toThrow();
    });

    it('should consistently render Header and Footer components across pages', () => {
      // Test Case: Checks for the presence of Header and Footer, common layout elements.
      // Business Context: Ensures consistent branding, navigation, and information (e.g., copyright in footer)
      // are available throughout the user journey.
      // Why: Missing headers/footers can lead to poor UX and navigation issues.
      renderApp('/'); // Render at a sample route
      expect(screen.getByText('HeaderMock')).toBeInTheDocument();
      expect(screen.getByText('FooterMock')).toBeInTheDocument();
    });

    // it('should initialize LogtoProvider with the correct application-specific configuration', () => {
    //   // Test Case: Verifies that LogtoProvider (mocked) is instantiated and receives the correct config object.
    //   // Business Context: Critical for ensuring the authentication system is configured correctly
    //   // (e.g., with the right appId and endpoint).
    //   // Why: Incorrect Logto configuration would break authentication flows.
    //   renderApp('/');
    //   expect(mockActualLogtoProvider).toHaveBeenCalledTimes(1);
    //   // Checks that LogtoProvider was called with props containing the mocked config object.
    //   // Functional component mocks are called with a single props object.
    //   expect(mockActualLogtoProvider).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       config: expect.objectContaining({
    //         appId: actualMockLogtoConfigObject.appId,
    //         endpoint: actualMockLogtoConfigObject.endpoint,
    //         // Add other properties from actualMockLogtoConfigObject if they are essential to check
    //       }),
    //       // We can also assert that children are passed, though their exact structure is complex.
    //       // children: expect.anything(), // or more specific if needed and stable
    //     })
    //     // Removed the second argument expect.anything() as the mock is a functional component
    //   );
    // });

    // Note: The DndProvider from react-dnd is part of App.tsx. Its basic presence is implicitly
    // tested by the app rendering without Dnd-related errors. Explicitly testing its VDOM presence
    // is often an anti-pattern. Functionality related to Dnd would be tested in components that use its features.
  });

  describe('Application Routing and Page Component Rendering', () => {
    describe('Publicly Accessible Routes', () => {
      it('should render HomePageMock for the root ("/") path', () => {
        // Test Case: Validates routing to the Home page for the application's root URL.
        // Business Context: The Home page is typically the primary entry point for users.
        // Why: Ensures users land on the correct initial page.
        renderApp('/');
        expect(screen.getByText('HomePageMock')).toBeInTheDocument();
      });

      it('should render CallbackPageMock for the "/callback" path', () => {
        // Test Case: Validates routing to the OAuth/OIDC callback page.
        // Business Context: This route is essential for the Logto authentication flow to complete.
        // Why: A non-functional callback route would break user login.
        renderApp('/callback');
        expect(screen.getByText('CallbackPageMock')).toBeInTheDocument();
      });
    });

    describe('Conditionally Public or User-Specific Routes', () => {
      // These routes are not explicitly wrapped by <ProtectedRoute> in App.tsx.
      // Their accessibility might depend on internal component logic or global auth state.
      // We test their rendering, assuming appropriate conditions (e.g., user is authenticated if required by the page itself).

      it('should render ProfilPageMock for "/profil" path (e.g., when user is authenticated)', () => {
        // Test Case: Validates routing to the user profile page.
        // Business Context: Allows users to view and manage their profile information.
        // Why: Ensures profile accessibility. Assumes Profil page might handle its own auth check or is for authenticated users.
        mockedUseLogto.mockReturnValueOnce({ 
          isAuthenticated: true, 
          isLoading: false,
          user: { sub: 'test-user-id', name: 'Test User' }, 
          getAccessToken: vi.fn().mockResolvedValue('fake-token'),
          getIdToken: vi.fn().mockResolvedValue('fake-id-token'), // Add getIdToken
          signIn: vi.fn(),
          signOut: vi.fn(),
          fetchUserInfo: vi.fn().mockResolvedValue({ sub: 'test-user-id', name: 'Test User' }), 
        }); 
        renderApp('/profil');
        expect(screen.getByText('ProfilPageMock')).toBeInTheDocument();
      });

      it('should render PlannerPageMock for "/planner" path (e.g., when user is authenticated)', () => {
        // Test Case: Validates routing to the meal planner page.
        // Business Context: Provides access to the core meal planning functionality.
        // Why: Ensures planner accessibility. Assumes Planner page might require authentication.
        mockedUseLogto.mockReturnValueOnce({ 
          isAuthenticated: true, 
          isLoading: false,
          user: { sub: 'test-user-id', name: 'Test User' }, 
          getAccessToken: vi.fn().mockResolvedValue('fake-token'),
          getIdToken: vi.fn().mockResolvedValue('fake-id-token'), // Add getIdToken
          signIn: vi.fn(),
          signOut: vi.fn(),
          fetchUserInfo: vi.fn().mockResolvedValue({ sub: 'test-user-id', name: 'Test User' }), 
        }); 
        renderApp('/planner');
        expect(screen.getByText('PlannerPageMock')).toBeInTheDocument();
      });

      it('should render MyRecipesPageMock for "/my-recipes" path (e.g., when user is authenticated)', () => {
        // Test Case: Validates routing to the user's saved recipes page.
        // Business Context: Allows users to access their personalized recipe collections.
        // Why: Ensures access to user-specific content. Assumes MyRecipes page might require authentication.
        mockedUseLogto.mockReturnValueOnce({ 
          isAuthenticated: true, 
          isLoading: false,
          user: { sub: 'test-user-id', name: 'Test User' }, 
          getAccessToken: vi.fn().mockResolvedValue('fake-token'),
          getIdToken: vi.fn().mockResolvedValue('fake-id-token'), // Add getIdToken
          signIn: vi.fn(),
          signOut: vi.fn(),
          fetchUserInfo: vi.fn().mockResolvedValue({ sub: 'test-user-id', name: 'Test User' }), 
        }); 
        renderApp('/my-recipes');
        expect(screen.getByText('MyRecipesPageMock')).toBeInTheDocument();
      });
    });

    describe('Protected Routes (Managed by ProtectedRoute Component)', () => {
      // Test configuration for routes wrapped with the <ProtectedRoute> component.
      const protectedRoutesConfig = [
        { path: '/dashboard', componentName: 'DashboardPageMock', pageTitle: 'Dashboard' },
        { path: '/recipes', componentName: 'AllRecipesPageMock', pageTitle: 'All Recipes' },
        { path: '/recipes/example-recipe-123', componentName: 'RecipeDetailsPageMock', pageTitle: 'Recipe Details' },
      ];

      protectedRoutesConfig.forEach(({ path, componentName}) => {
        // it(`should render ${pageTitle} page at "${path}" when user is authenticated`, async () => {
        //   // Test Case: Verifies authenticated users can access protected content.
        //   // Business Context: Ensures core application features (dashboard, recipes) are available post-login.
        //   // Why: Validates the primary access control mechanism for authenticated sections.
        //   mockedUseLogto.mockReturnValue({
        //     isAuthenticated: true,
        //     isLoading: false,
        //     getAccessToken: vi.fn().mockResolvedValue('fake-token'),
        //     getIdToken: vi.fn().mockResolvedValue('fake-id-token'), // Add getIdToken
        //     user: { sub: 'test-user-id', name: 'Test User' }, 
        //     signIn: vi.fn(),
        //     signOut: vi.fn(),
        //     fetchUserInfo: vi.fn().mockResolvedValue({ sub: 'test-user-id', name: 'Test User' }), 
        //   });
        //   renderApp(path);
        //   // ProtectedRoute should render its children (the page component) when authenticated.
        //   await waitFor(() => {
        //     expect(screen.getByText(componentName)).toBeInTheDocument();
        //   });
        // });

        it(`should redirect to Home page from "${path}" when user is unauthenticated (handled by ProtectedRoute)`, async () => {
          // Test Case: Verifies unauthenticated users are redirected from protected routes.
          // Business Context: Critical for application security, preventing unauthorized access.
          // Why: Ensures ProtectedRoute correctly enforces authentication by redirecting to a safe page (e.g., Home).
          // This test relies on the actual ProtectedRoute component's logic to navigate to "/"
          // when isAuthenticated is false and isLoading is false.
          mockedUseLogto.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null, 
            getAccessToken: vi.fn().mockResolvedValue(null),
            getIdToken: vi.fn().mockResolvedValue(null), // Add getIdToken
            signIn: vi.fn(),
            signOut: vi.fn(),
            fetchUserInfo: vi.fn().mockResolvedValue(null), 
          });
          renderApp(path); // Attempt to access the protected path

          // Expect ProtectedRoute to trigger a navigation to "/".
          await waitFor(() => {
            // After redirection, the HomePageMock should be visible.
            expect(screen.getByText('HomePageMock')).toBeInTheDocument();
          });
          // The protected component itself should not have been rendered.
          expect(screen.queryByText(componentName)).not.toBeInTheDocument();
        });

        it(`should display "Loading..." indicator for "${path}" when authentication state is loading (handled by ProtectedRoute)`, async () => {
          // Test Case: Verifies a loading state is shown while authentication status is being determined.
          // Business Context: Provides user feedback during potentially slow auth checks, improving UX.
          // Why: Ensures ProtectedRoute displays its loading indicator (e.g., "Loading...") as expected.
          // This test relies on the actual ProtectedRoute component rendering "Loading..."
          // when isLoading is true.
          mockedUseLogto.mockReturnValue({
            isAuthenticated: false, 
            isLoading: true,
            user: null, 
            getAccessToken: vi.fn().mockResolvedValue(null),
            getIdToken: vi.fn().mockResolvedValue(null), // Add getIdToken
            signIn: vi.fn(),
            signOut: vi.fn(),
            fetchUserInfo: vi.fn().mockResolvedValue(null), 
          });
          renderApp(path);

          await waitFor(() => {
            // The text "Loading..." is expected from the actual ProtectedRoute component.
            expect(screen.getByText('Loading...')).toBeInTheDocument();
          });
          // The protected component should not be rendered during the loading state.
          expect(screen.queryByText(componentName)).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Error Handling and Edge Case Scenarios', () => {
    it('should handle unknown routes gracefully by rendering Header/Footer but no specific page content', () => {
      // Test Case: Validates behavior for routes not defined in App.tsx.
      // Business Context: Ensures the application remains stable and provides a consistent layout
      // even for invalid URLs, preventing crashes or blank pages.
      // Why: React Router's default is to render nothing for unmatched routes if no catch-all ("*") route is defined.
      // This test confirms that behavior while ensuring essential layout elements (Header/Footer) persist.
      renderApp('/this-route-does-not-exist-in-the-app');

      // Header and Footer should always be present as part of the main layout.
      expect(screen.getByText('HeaderMock')).toBeInTheDocument();
      expect(screen.getByText('FooterMock')).toBeInTheDocument();

      // Verify that none of the known page mock components are rendered.
      expect(screen.queryByText('HomePageMock')).not.toBeInTheDocument();
      expect(screen.queryByText('DashboardPageMock')).not.toBeInTheDocument();
      expect(screen.queryByText('AllRecipesPageMock')).not.toBeInTheDocument();
      // Add checks for other page mocks if desired for thoroughness.
      // This implicitly confirms that no defined page component matched the unknown route.
    });
  });

  // Accessibility (A11y) Notes:
  // - The App.tsx component is primarily a structural and routing orchestrator.
  // - Detailed a11y tests (e.g., for ARIA attributes, keyboard navigation, color contrast)
  //   are more relevant for individual UI components (Header, Footer, specific pages).
  // - App.tsx contributes to a11y by ensuring a logical document structure (through Header, Footer, and routed content)
  //   and by correctly integrating providers like DndProvider which may have a11y implications in their usage.
  // - No specific a11y tests are added here for App.tsx itself, assuming child components are tested individually.
  // - Important Logic Not Tested: Deep interaction testing with DndProvider or specific behaviors of LogtoProvider
  //   beyond configuration are out of scope for App.test.tsx and would be part of their respective library tests
  //   or tests for components directly using those features.
});
