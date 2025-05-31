import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test } from 'vitest';

// Note: Image imports like `food1` from "../../../assets/..."
// are typically handled by Vitest/Jest's moduleNameMapper or asset transformers.
// For these tests, we assume they resolve to strings (e.g., filenames or mock paths),
// which is sufficient for testing `src` attribute presence and `alt` text.

describe('HeroSection Component', () => {
  // Test suite for the HeroSection component.
  // This component is a critical part of the home page, displaying a dynamic image loop
  // and key promotional text. Tests focus on ensuring content integrity and basic accessibility.

  beforeEach(() => {
    // Render the HeroSection component before each individual test.
    // This practice ensures that each test runs in a clean, isolated environment,
    // preventing side effects from one test influencing another.
    render(<HeroSection />);
  });

  test('should render the main heading and paragraph text correctly', () => {
    // This test verifies that the primary textual content of the hero section is rendered as expected.
    // The heading and paragraph convey the core value proposition to the user.
    // Business context: Accurate display of these texts is crucial for marketing and user engagement.

    // Verify the H1 heading "Finde Deine Balance" is present.
    // The text is within spans, but `toHaveTextContent` checks the combined content.
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveTextContent('Finde Deine Balance');

    // Verify the paragraph "mit ausgewogenen Gerichten zum Selbstkochen." is present.
    // Similar to the heading, this text might be structured with inline elements.
    // We use a partial text match to locate the paragraph element for robustness,
    // then assert its full content.
    const paragraphElement = screen.getByText((content, element) => {
      // Custom text matcher to find the paragraph, accommodating potential HTML structure.
      const hasText = (node: Element | null) => node?.textContent === "mit ausgewogenen Gerichten zum Selbstkochen.";
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child as Element));
      return elementHasText && childrenDontHaveText;
    });
    expect(paragraphElement).toBeInTheDocument();
    expect(paragraphElement).toHaveTextContent('mit ausgewogenen Gerichten zum Selbstkochen.');
  });

  test('should render the correct number of images in the looping gallery', () => {
    // This test validates that the image looping mechanism functions by duplicating the image set.
    // The component displays 9 unique images, which are then duplicated to create a seamless loop effect,
    // resulting in 18 image elements in the DOM.
    // Business context: The image loop is a key visual feature designed to attract and retain user attention.

    const images = screen.getAllByRole('img');
    // Expect 9 unique images duplicated, totaling 18.
    expect(images).toHaveLength(18);
  });

  test('should render images with correct alt text and src attributes', () => {
    // This test ensures that all images within the gallery are accessible and correctly referenced.
    // Each image must have a `src` attribute pointing to an image file and an `alt` attribute
    // describing the image content for screen readers and if the image fails to load.
    // Business context: Adherence to accessibility standards (WCAG) and ensuring visual content is properly displayed.

    const images = screen.getAllByRole('img'); // Fetches all 18 images
    images.forEach((img, index) => {
      // Verify that the src attribute is present and not empty.
      // The actual value of src will be the path/filename as resolved by the build/test environment.
      expect(img).toHaveAttribute('src');
      expect(img.getAttribute('src')).not.toBe('');

      // Verify the alt text. According to the component's implementation,
      // alt text is "Meal X", where X is the 1-based index in the `loopImages` array.
      expect(img).toHaveAttribute('alt', `Meal ${index + 1}`);
    });
  });

  // Important Considerations Not Covered by these Tests:
  // 1. CSS Animations: The actual looping animation (`home-image-loop`) is CSS-driven.
  //    React Testing Library does not test visual rendering or animations.
  //    Verifying the animation would require visual regression testing tools or e2e tests (e.g., Playwright, Cypress).
  // 2. Responsiveness: While the component might be responsive via CSS, these tests do not
  //    explicitly verify layout changes across different viewport sizes.
  //    Responsive testing often involves tools that can control viewport dimensions.
  // 3. Image Loading: These tests confirm `src` attributes are set, but not that images actually load successfully.
  //    Network-level checks or more advanced e2e tests could cover this.
});
