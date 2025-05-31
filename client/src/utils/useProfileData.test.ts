import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as LogtoReact from '@logto/react'; // Used to type the mock
import { format as formatDateFns } from 'date-fns'; // For verifying date formatting

// Type for the module we will import dynamically
let useProfileDataModule: typeof import('./useProfileData');

// Mock @logto/react
// This mock function will be assigned to useLogto via vi.mock
const mockUseLogto = vi.fn();
vi.mock('@logto/react', async (importOriginal) => {
  const actual = await importOriginal<typeof LogtoReact>();
  return {
    ...actual,
    useLogto: mockUseLogto, // Assign the hoisted mockUseLogto function here
  };
});

describe('useProfileData Hook', () => {
  let mockFetchUserInfo: Mock;

  beforeEach(async () => {
    // Reset modules to clear the module-level 'cachedData' in useProfileData.ts
    // This ensures that each test starts with a clean slate for the hook's module-level cache.
    vi.resetModules();

    // Re-import the hook's module after resetting. This ensures we get a fresh version
    // with `cachedData` reset to `null`.
    useProfileDataModule = await import('./useProfileData');

    // Reset the main mock function for useLogto itself and its internal fetchUserInfo mock
    mockUseLogto.mockReset();
    mockFetchUserInfo = vi.fn();

    // Set up a default mock implementation for useLogto for most tests.
    // Individual tests can override this if they need different behavior.
    mockUseLogto.mockReturnValue({
      fetchUserInfo: mockFetchUserInfo,
      isAuthenticated: true,  // Default to authenticated
      isLoading: false,       // Default to not loading
    });
  });

  afterEach(() => {
    // Clear all mock call history and custom implementations after each test
    vi.clearAllMocks();
  });

  // Test 1: Initial state verification
  it('should return initial state with loading true when no cached data exists and authenticated', async () => {
    // Business Context: When the hook is first invoked and no profile data is cached,
    // it should immediately indicate a loading state while it attempts to fetch the data.
    // This allows UI components to display appropriate loading indicators.
    mockFetchUserInfo.mockReturnValue(new Promise(() => {})); // Simulate a fetch that never resolves, keeping it in a loading-like state

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    expect(result.current.profileData).toBeNull(); // No data initially
    expect(result.current.loading).toBe(true);     // Should be loading
    expect(result.current.error).toBeNull();       // No error initially
    // Verify that fetchUserInfo is called because conditions (authenticated, not loading, no cache) are met
    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1);
  });

  // Test 2: Successful data fetching and state update
  it('should fetch and set profile data when authenticated, not loading, and no cache exists', async () => {
    // Business Context: This tests the primary success scenario. When the user is authenticated
    // and the hook is called, it should fetch the user's profile information and update its state,
    // making the data available for UI display.
    const rawCreatedAtDate = new Date('2023-01-01T12:00:00Z');
    const mockUserInfo = {
      username: 'testuser',
      email: 'test@example.com',
      created_at: rawCreatedAtDate.toISOString(),
    };
    mockFetchUserInfo.mockResolvedValue(mockUserInfo); // Simulate successful API response

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    expect(result.current.loading).toBe(true); // Starts in loading state

    // Wait for asynchronous operations (fetch) and subsequent state updates to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false); // Loading should be false after fetch
    });

    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1); // Ensure fetch was called
    expect(result.current.profileData).toEqual({
      username: 'testuser',
      email: 'test@example.com',
      createdAt: formatDateFns(rawCreatedAtDate, "dd.MM.yyyy HH:mm:ss"), // Verify data transformation
    });
    expect(result.current.error).toBeNull(); // No error should be present
  });

  // Test 3: Caching behavior
  it('should use cached data and not re-fetch if data is already cached from a previous hook usage', async () => {
    // Business Context: To enhance performance and minimize API calls, profile data is cached
    // at the module level. This test ensures that if data has been fetched by one instance/usage
    // of the hook, subsequent instances/usages will retrieve data from the cache rather than re-fetching.
    const rawCreatedAtDate = new Date('2023-02-01T10:00:00Z');
    const mockUserInfo = {
      username: 'cachedUser',
      email: 'cached@example.com',
      created_at: rawCreatedAtDate.toISOString(),
    };
    mockFetchUserInfo.mockResolvedValueOnce(mockUserInfo); // Mock for the first fetch

    // First hook render: fetches data and populates the cache
    const { result: firstRenderResult } = renderHook(() => useProfileDataModule.useProfileData());
    await waitFor(() => expect(firstRenderResult.current.loading).toBe(false)); // Wait for first fetch

    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1); // Fetch occurred once
    expect(firstRenderResult.current.profileData?.username).toBe('cachedUser');

    // Second hook render: should use cached data
    // (Simulates another component using the hook, or the same component re-rendering after unmount/mount)
    const { result: secondRenderResult } = renderHook(() => useProfileDataModule.useProfileData());

    // `loading` should be false immediately because `cachedData` is populated at the module level.
    expect(secondRenderResult.current.loading).toBe(false);
    // Data should be identical to the first render's data, served from cache.
    expect(secondRenderResult.current.profileData).toEqual(firstRenderResult.current.profileData);
    // Crucially, `fetchUserInfo` should NOT have been called again.
    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1);
  });

  // Test 4: Handling missing fields in user info
  it('should handle missing username, email, and created_at from user info by using default values', async () => {
    // Business Context: User information from an identity provider might not always be complete.
    // The hook must gracefully handle cases where fields like username, email, or creation date are
    // missing (null or undefined), providing sensible defaults to prevent UI errors.
    const mockUserInfoMissingFields = {
      username: undefined, // Test with undefined username
      email: null,       // Test with null email
      // `created_at` will be effectively undefined as it's not in the object
    };
    mockFetchUserInfo.mockResolvedValue(mockUserInfoMissingFields);

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for fetch and processing

    expect(result.current.profileData).toEqual({
      username: 'Kein Name', // Default value from the hook for missing username
      email: 'Keine Email',   // Default value from the hook for missing email
      createdAt: 'Unbekanntes Erstellungsdatum', // Default for missing creation date
    });
    expect(result.current.error).toBeNull();
  });

  // Test 5: Specific date formatting verification
  it('should correctly format an ISO createdAt date string to "dd.MM.yyyy HH:mm:ss" in local time', async () => {
    // Business Context: For consistency and readability, user creation dates should be displayed
    // in a specific format. This test verifies that the ISO date string from the backend
    // is correctly transformed into the desired "dd.MM.yyyy HH:mm:ss" format, reflecting local time.
    const specificIsoDateString = '2024-07-27T15:30:45Z'; // A specific UTC date string
    const dateObjectForFormatting = new Date(specificIsoDateString); // JS Date object representing this UTC moment

    const mockUserInfoWithSpecificDate = {
      username: 'dateUser',
      email: 'date@example.com',
      created_at: specificIsoDateString,
    };
    mockFetchUserInfo.mockResolvedValue(mockUserInfoWithSpecificDate);

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The hook uses `date-fns/format`. The expected output is this UTC moment formatted
    // into "dd.MM.yyyy HH:mm:ss" according to the local timezone of the test environment.
    const expectedFormattedDate = formatDateFns(dateObjectForFormatting, "dd.MM.yyyy HH:mm:ss");
    expect(result.current.profileData?.createdAt).toBe(expectedFormattedDate);
  });

  // Test 6: Behavior when not authenticated
  it('should not fetch data and return loading true (due to no cache) if user is not authenticated', async () => {
    // Business Context: Profile data is typically only relevant for authenticated users.
    // If the user is not authenticated, the hook should avoid making API calls.
    // The `loading` state remains true because `cachedData` is null and the condition to set `loading` to `false`
    // (i.e. successful fetch or error) is not met.
    mockUseLogto.mockReturnValue({
      fetchUserInfo: mockFetchUserInfo,
      isAuthenticated: false, // Key condition: user is not authenticated
      isLoading: false,
    });

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    // `useEffect` runs, `fetchData` is called, but it should return early due to `!isAuthenticated`.
    // The `finally` block in `fetchData` (which sets `loading` to `false`) is not reached.
    // `profileData` remains `null` (initial state from `useState(cachedData)` where `cachedData` is null via `resetModules`).
    // `loading` remains `true` (initial state from `useState(!cachedData)`).
    expect(result.current.profileData).toBeNull();
    expect(result.current.loading).toBe(true); // Stays true as fetch doesn't proceed to completion/error
    expect(result.current.error).toBeNull();
    expect(mockFetchUserInfo).not.toHaveBeenCalled(); // Fetch should not be attempted
  });

  // Test 7: Behavior when Logto auth state is loading
  it('should not fetch data and return loading true (due to no cache) if Logto auth state is loading', async () => {
    // Business Context: To prevent premature actions based on an indeterminate authentication state,
    // the hook should wait if the authentication provider (Logto) itself is still loading/resolving the auth status.
    // Similar to the "not authenticated" case, `loading` state reflects data isn't available and fetch is deferred.
    mockUseLogto.mockReturnValue({
      fetchUserInfo: mockFetchUserInfo,
      isAuthenticated: true, // This could be true or false; `isLoading` is the decisive factor here
      isLoading: true,       // Key condition: Logto is busy
    });

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    // `fetchData` should bail early due to `isLoading` being true.
    // `loading` state logic is similar to the "not authenticated" case.
    expect(result.current.profileData).toBeNull();
    expect(result.current.loading).toBe(true); // Stays true
    expect(result.current.error).toBeNull();
    expect(mockFetchUserInfo).not.toHaveBeenCalled(); // Fetch should not be attempted
  });

  // Test 8: Error handling during data fetch
  it('should set an error state and stop loading if fetchUserInfo throws an error', async () => {
    // Business Context: Network problems or backend issues can cause data fetching to fail.
    // The hook must catch such errors, update its state to reflect the error, and ensure `loading` is set to false.
    // This enables the UI to display an appropriate error message to the user.
    const mockErrorObject = new Error('Network Error: User info fetch failed');
    mockFetchUserInfo.mockRejectedValue(mockErrorObject); // Simulate an API error

    const { result } = renderHook(() => useProfileDataModule.useProfileData());

    expect(result.current.loading).toBe(true); // Initially loading

    // Wait for the fetch attempt to fail and for the state to update
    await waitFor(() => {
      // The `finally` block in `fetchData` should set `loading` to `false` even on error.
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1); // Fetch was attempted
    expect(result.current.profileData).toBeNull();     // Data remains null due to fetch failure
    expect(result.current.error).toBe(mockErrorObject); // The error object should be set in state
  });

  // Test 9: Prevention of multiple fetches using `fetchedRef`
  it('should only attempt to fetch data once even if the hook re-renders while an initial fetch is in progress', async () => {
    // Business Context: React components can re-render frequently. If a data fetch is already underway,
    // subsequent re-renders (and thus re-executions of the hook's effect) should not trigger new,
    // redundant API calls. The `fetchedRef` in the hook is designed to prevent this.
    let resolveFetchPromise: (value: unknown) => void = () => {};
    const longRunningFetchPromise = new Promise(resolve => { resolveFetchPromise = resolve; });
    mockFetchUserInfo.mockReturnValue(longRunningFetchPromise); // Simulate a fetch that takes time

    const { rerender } = renderHook(() => useProfileDataModule.useProfileData());

    // First render initiates the fetch
    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1);

    // Simulate a re-render of the component (e.g., due to parent state change)
    rerender();

    // `fetchUserInfo` should still only have been called once. The `fetchedRef.current`
    // becomes `true` when `fetchData` starts, preventing re-entry into the main fetch logic
    // on subsequent effect runs if the other conditions (`isAuthenticated`, `!isLoading`, `!cachedData`) are still met.
    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1);

    // Clean up: resolve the pending promise to avoid issues with other tests or Vitest hanging
    await act(async () => {
      resolveFetchPromise({ username: 'resolvedUser', email: 'resolved@example.com', created_at: new Date().toISOString() });
      // Allow microtasks (like promise resolution) to flush
      await Promise.resolve();
    });
  });

  // Test 10: Fetches data when authentication status changes from false to true
  it('should fetch data when isAuthenticated status changes from false to true on a re-render', async () => {
    // Business Context: If a user logs in while a component using this hook is already mounted,
    // the hook should react to this change in authentication status (propagated by `useLogto`)
    // and then proceed to fetch the profile data.
    mockUseLogto.mockReturnValue({ // Initial state: user is not authenticated
      fetchUserInfo: mockFetchUserInfo,
      isAuthenticated: false,
      isLoading: false,
    });

    const { result, rerender } = renderHook(() => useProfileDataModule.useProfileData());

    // Initially, user is not authenticated, so no fetch attempt should be made.
    expect(mockFetchUserInfo).not.toHaveBeenCalled();
    expect(result.current.profileData).toBeNull();
    expect(result.current.loading).toBe(true); // True because `cachedData` is null and fetch doesn't complete

    // Simulate user logging in: `isAuthenticated` becomes true.
    // This change will be picked up by the hook's `useEffect` dependencies.
    mockUseLogto.mockReturnValue({
      fetchUserInfo: mockFetchUserInfo,
      isAuthenticated: true, // User is now authenticated
      isLoading: false,
    });
    const rawCreatedAtDateOnAuth = new Date('2023-03-01T00:00:00Z');
    const mockUserInfoAfterAuth = {
      username: 'newlyAuthUser',
      email: 'newly@authenticated.com',
      created_at: rawCreatedAtDateOnAuth.toISOString(),
    };
    mockFetchUserInfo.mockResolvedValue(mockUserInfoAfterAuth); // Setup fetch response for when it's called

    rerender(); // Re-render the hook; its `useEffect` will run due to `isAuthenticated` changing.

    await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for fetch and state update

    expect(mockFetchUserInfo).toHaveBeenCalledTimes(1); // Fetch should now have been called
    expect(result.current.profileData).toEqual({
      username: 'newlyAuthUser',
      email: 'newly@authenticated.com',
      createdAt: formatDateFns(rawCreatedAtDateOnAuth, "dd.MM.yyyy HH:mm:ss"),
    });
    expect(result.current.error).toBeNull();
  });

  // General Comment on Test Coverage:
  // These tests aim to cover all significant logical paths within the `useProfileData` hook:
  // - Initialization under various conditions (cached data, no cached data).
  // - Behavior based on `isAuthenticated` and `isLoading` from `useLogto`.
  // - Successful data fetching and transformation.
  // - Graceful handling of missing data fields.
  // - Module-level caching to prevent redundant API calls.
  // - Error handling during API calls.
  // - Prevention of multiple concurrent fetches (`fetchedRef`).
  // - Reactivity to changes in dependencies (e.g., authentication status).
  // The use of `vi.resetModules()` is crucial for testing the module-level cache correctly.
  // The mocking of `useLogto` allows for precise control over the hook's dependencies.
});
