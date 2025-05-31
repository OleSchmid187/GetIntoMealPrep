import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import RecipeImage from "./RecipeImage"; // Adjust path as necessary
import { getImageUrl as originalGetImageUrl } from "../../utils/getImageUrl"; // Import for type, if needed, or direct mock

// Mock the getImageUrl utility
// This allows us to control its output and verify it's called correctly
// without relying on its actual implementation.
vi.mock("../../utils/getImageUrl", () => ({
  getImageUrl: vi.fn(),
}));

// Cast the mocked function to access Jest/Vitest mock functions like mockReturnValue
const mockedGetImageUrl = originalGetImageUrl as Mock;

describe("RecipeImage Component", () => {
  const defaultAltText = "Test Recipe Image";
  const defaultSrc = "test-image.jpg";
  const processedSrc = "http://cdn.example.com/test-image.jpg";
  const fallbackSrc = "/fallback.png"; // As defined in the component

  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    vi.clearAllMocks();
    // Default mock implementation for getImageUrl
    mockedGetImageUrl.mockImplementation((src) => src ? `processed-${src}` : 'processed-undefined-src');
  });

  describe("Core Rendering and Attribute Handling", () => {
    it("should render an image element with the correct alt text", () => {
      // Test Purpose: Verifies that the component renders an HTML <img> element
      // and that the `alt` prop is correctly passed to this element.
      // Business Context: Alt text is crucial for accessibility (screen readers) and SEO.
      // It describes the image content if the image cannot be displayed or seen.
      mockedGetImageUrl.mockReturnValue(processedSrc);
      render(<RecipeImage src={defaultSrc} alt={defaultAltText} />);
      
      const imgElement = screen.getByRole("img");
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute("alt", defaultAltText);
    });

    it("should apply custom CSS class when className prop is provided", () => {
      // Test Purpose: Ensures that styling customization via the `className` prop works as expected.
      // Business Context: Allows developers to integrate the component seamlessly into various
      // layouts and apply specific styles defined in their CSS or styling solution.
      const customClass = "my-custom-recipe-image";
      mockedGetImageUrl.mockReturnValue(processedSrc);
      render(<RecipeImage src={defaultSrc} alt={defaultAltText} className={customClass} />);
      
      const imgElement = screen.getByRole("img");
      expect(imgElement).toHaveClass(customClass);
    });

    it("should call getImageUrl with the src prop and use its return value for the image src attribute", () => {
      // Test Purpose: Tests the integration with the `getImageUrl` utility.
      // It verifies that the component correctly calls `getImageUrl` with the provided `src`
      // and uses the string returned by `getImageUrl` as the `src` attribute of the <img> element.
      // Business Context: `getImageUrl` might handle complex logic like prefixing base URLs,
      // selecting image variants based on device, or other image processing tasks.
      const specificProcessedSrc = "http://cdn.example.com/specific-image.png";
      mockedGetImageUrl.mockReturnValue(specificProcessedSrc);

      render(<RecipeImage src={defaultSrc} alt={defaultAltText} />);
      
      expect(mockedGetImageUrl).toHaveBeenCalledTimes(1);
      expect(mockedGetImageUrl).toHaveBeenCalledWith(defaultSrc);
      
      const imgElement = screen.getByRole("img") as HTMLImageElement;
      expect(imgElement.src).toBe(specificProcessedSrc);
    });

    it("should handle undefined src prop by calling getImageUrl with undefined", () => {
      // Test Purpose: Verifies the component's behavior when the `src` prop is not provided (undefined).
      // It ensures `getImageUrl` is still called, allowing the utility to potentially provide a default image path.
      // Business Context: Important for scenarios where an image might be optional, or a default placeholder
      // is managed by the `getImageUrl` utility.
      const processedUndefinedSrc = "http://cdn.example.com/default-placeholder.jpg";
      mockedGetImageUrl.mockReturnValue(processedUndefinedSrc); // Mock specific return for undefined input

      render(<RecipeImage alt={defaultAltText} />); // src is undefined
      
      expect(mockedGetImageUrl).toHaveBeenCalledTimes(1);
      expect(mockedGetImageUrl).toHaveBeenCalledWith(undefined);
      
      const imgElement = screen.getByRole("img") as HTMLImageElement;
      expect(imgElement.src).toBe(processedUndefinedSrc);
    });

    it("should handle an empty string src prop by calling getImageUrl with an empty string", () => {
        // Test Purpose: Verifies the component's behavior when the `src` prop is an empty string.
        // It ensures `getImageUrl` is called with the empty string, allowing the utility to handle this specific case.
        // Business Context: An empty string might signify a specific state or require special handling by `getImageUrl`,
        // potentially returning a default image or a specific placeholder.
        const processedEmptySrc = "http://cdn.example.com/empty-src-placeholder.jpg";
        mockedGetImageUrl.mockReturnValue(processedEmptySrc);

        render(<RecipeImage src="" alt={defaultAltText} />);
        
        expect(mockedGetImageUrl).toHaveBeenCalledTimes(1);
        expect(mockedGetImageUrl).toHaveBeenCalledWith("");
        
        const imgElement = screen.getByRole("img") as HTMLImageElement;
        expect(imgElement.src).toBe(processedEmptySrc);
    });
  });

  describe("Image Loading Error Handling", () => {
    it("should display a fallback image when the primary image encounters an error", () => {
      // Test Purpose: Validates that the `onError` event handler on the <img> element
      // correctly switches the image `src` to a predefined fallback image path.
      // Business Context: Crucial for user experience. If an image fails to load (e.g., network issue,
      // broken link), displaying a fallback prevents a broken image icon and maintains layout integrity.
      mockedGetImageUrl.mockReturnValue(processedSrc); // Initial src
      render(<RecipeImage src={defaultSrc} alt={defaultAltText} />);
      
      const imgElement = screen.getByRole("img") as HTMLImageElement;
      expect(imgElement.src).toBe(processedSrc); // Check initial src

      // Simulate the image failing to load by firing the 'error' event
      fireEvent.error(imgElement);
      
      // Verify the src attribute has been updated to the fallback image path
      expect(imgElement.src).toBe(window.location.origin + fallbackSrc); // Browsers prepend origin to relative paths
    });
  });

  describe("Accessibility Considerations", () => {
    it("should always render an image with a non-empty alt attribute for accessibility compliance", () => {
      // Test Purpose: Ensures that the `alt` attribute is always present and populated on the <img> element.
      // Business Context: The `alt` attribute is a fundamental aspect of web accessibility (WCAG).
      // It provides a textual alternative for screen readers for users who cannot see the image.
      // Even decorative images should have an alt attribute, though it might be empty (alt="").
      // However, this component's `alt` prop is mandatory and typed as string, implying meaningful text.
      const meaningfulAltText = "A delicious looking lasagna";
      mockedGetImageUrl.mockReturnValue(processedSrc);
      render(<RecipeImage src={defaultSrc} alt={meaningfulAltText} />);
      
      const imgElement = screen.getByRole("img");
      expect(imgElement).toHaveAttribute("alt", meaningfulAltText);
      expect(meaningfulAltText).not.toBe(""); // Ensure it's not an empty string for this test case
    });

    // Note: Further accessibility tests like focus management or keyboard navigation are not directly
    // applicable to a simple <img> element unless it's part of a more complex interactive component.
    // The primary accessibility concern for <img> is the `alt` text.
  });

  // Note on Coverage:
  // This test suite aims for high coverage of the RecipeImage component's logic:
  // - Rendering with various props (src, alt, className).
  // - Interaction with the `getImageUrl` utility (mocked).
  // - Error handling for image loading.
  // - Basic accessibility (alt text).
  // The fallback image path `/fallback.png` is assumed to be a static asset available in the public folder.
});
