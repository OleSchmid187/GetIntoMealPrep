import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getImageUrl } from './getImageUrl';

// Mocking import.meta.env
// Vitest automatically mocks import.meta.env, but we can control its values for specific tests.

describe('getImageUrl Utility Function', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset environment variables before each test to ensure test isolation
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    // Restore original environment variables after each test
    for (const key in originalEnv) {
      vi.stubEnv(key, originalEnv[key]);
    }
  });

  // Test suite for scenarios where a fallback image is expected
  describe('Fallback Image Scenarios', () => {
    it('should return the fallback image path when the provided path is undefined', () => {
      // This test verifies that if no image path is supplied, the function gracefully defaults
      // to a predefined fallback image. This is crucial for preventing broken image links in the UI.
      const result = getImageUrl(undefined);
      expect(result).toBe('/fallback.png');
    });

    it('should return the fallback image path when the provided path is an empty string', () => {
      // Similar to the undefined path, an empty string path should also result in the fallback image.
      // This handles cases where a path might be an empty string due to data inconsistencies.
      const result = getImageUrl('');
      expect(result).toBe('/fallback.png');
    });
  });

  // Test suite for scenarios involving relative paths that need prefixing with the API base URL
  describe('Relative Path Scenarios with API_BASE', () => {
    const testApiPath = '/images/test.jpg';

    it('should prefix a relative path with VITE_API_URL when it is set', () => {
      // This test ensures that if VITE_API_URL is defined in the environment,
      // relative image paths (starting with '/') are correctly prepended with this URL.
      // This is typical for production or staging environments where the API is on a different domain.
      const customApiUrl = 'https://api.example.com';
      vi.stubEnv('VITE_API_URL', customApiUrl);

      const result = getImageUrl(testApiPath);
      expect(result).toBe(`${customApiUrl}${testApiPath}`);
    });

    it('should prefix a relative path with the default "http://localhost" if VITE_API_URL is not set', () => {
      // This test verifies the default behavior when VITE_API_URL is not set.
      // The function should default to "http://localhost" for local development convenience.
      // Note: Vitest's import.meta.env mock might be empty by default if not stubbed.
      // We ensure VITE_API_URL is explicitly undefined for this test.
      vi.stubEnv('VITE_API_URL', ''); // or undefined, to simulate it not being set

      const result = getImageUrl(testApiPath);
      // The implementation uses `|| "http://localhost"`, so an empty string VITE_API_URL also triggers the default.
      expect(result).toBe(`http://localhost${testApiPath}`);
    });

    it('should handle VITE_API_URL having a trailing slash correctly', () => {
        // This test ensures that if VITE_API_URL has a trailing slash,
        // and the path also starts with a slash, the function correctly joins them
        // without creating double slashes in the final URL.
        // The utility function has been updated to handle this.
        const customApiUrlWithSlash = 'http://localhost:5000/';
        vi.stubEnv('VITE_API_URL', customApiUrlWithSlash);
        const result = getImageUrl(testApiPath); // testApiPath is '/images/test.jpg'
        
        // The expected result is the API base with its trailing slash,
        // followed by the path with its leading slash removed.
        // e.g., 'http://localhost:5000/' + 'images/test.jpg'
        expect(result).toBe(`${customApiUrlWithSlash}${testApiPath.substring(1)}`);
      });
  });

  // Test suite for scenarios where the provided path is an absolute URL
  describe('Absolute Path Scenarios', () => {
    it('should return the path as is if it is an absolute URL (e.g., starts with http)', () => {
      // This test ensures that if a full URL (e.g., from an external CDN or already processed)
      // is passed to the function, it is returned unchanged.
      // This prevents accidental prefixing of already complete URLs.
      const absoluteUrl = 'https://cdn.example.com/images/another.jpg';
      const result = getImageUrl(absoluteUrl);
      expect(result).toBe(absoluteUrl);
    });

    it('should return the path as is if it is an absolute URL (e.g., starts with https)', () => {
      // Similar to the HTTP test, but for HTTPS URLs.
      const absoluteHttpsUrl = 'https://cdn.example.com/images/secure.jpg';
      const result = getImageUrl(absoluteHttpsUrl);
      expect(result).toBe(absoluteHttpsUrl);
    });

    it('should return a path as is if it does not start with "/" but is not a common absolute URL scheme (e.g. blob:)', () => {
        // This test covers cases where a path might be a data URL or blob URL,
        // which should also be returned as is.
        const blobUrl = 'blob:http://localhost:5173/abc-def-ghi';
        const result = getImageUrl(blobUrl);
        expect(result).toBe(blobUrl);
      });
  });

  // Test for edge case: path is just "/"
  describe('Edge Case: Path is a single slash', () => {
    it('should correctly prefix a single slash path with the API base URL', () => {
      // This test checks the behavior when the path is just "/".
      // It should be treated as a relative path and prefixed.
      const customApiUrl = 'https://api.example.com';
      vi.stubEnv('VITE_API_URL', customApiUrl);

      const result = getImageUrl('/');
      expect(result).toBe(`${customApiUrl}/`);
    });
  });
});
