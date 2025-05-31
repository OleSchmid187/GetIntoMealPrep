import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeaturesSection from './FeatureSection';

// Mock image imports. Vitest, by default, doesn't process static image files
// like Webpack or Parcel would. We provide a simple string mock for the path.
vi.mock('../../../assets/feature1.jpg', () => ({ default: 'feature1.jpg' }));
vi.mock('../../../assets/feature2.jpg', () => ({ default: 'feature2.jpg' }));
vi.mock('../../../assets/feature3.jpg', () => ({ default: 'feature3.jpg' }));

describe('FeaturesSection Component', () => {
  // Test Data: Defines the expected content for each feature.
  // This approach keeps tests DRY and makes it easy to manage feature data.
  // Regex is used for flexibility in matching text content.
  const features = [
    {
      imgAltRegex: /Wochenplan erstellen/i, // German: "Create weekly plan"
      headingRegex: /Wochenplan erstellen/i,
      descriptionRegex: /Plane deine Mahlzeiten mit nur wenigen Klicks./i, // German: "Plan your meals with just a few clicks."
      imgSrcFilename: 'feature1.jpg',
    },
    {
      imgAltRegex: /Automatische Einkaufsliste/i, // German: "Automatic shopping list"
      headingRegex: /Automatische Einkaufsliste/i,
      descriptionRegex: /Alle Zutaten gesammelt – direkt aufs Handy./i, // German: "All ingredients collected – directly on your phone."
      imgSrcFilename: 'feature2.jpg',
    },
    {
      imgAltRegex: /Nährwert im Blick/i, // German: "Nutrition at a glance"
      headingRegex: /Nährwert im Blick/i,
      descriptionRegex: /Erkenne sofort, was du deinem Körper gibst./i, // German: "Instantly see what you're giving your body."
      imgSrcFilename: 'feature3.jpg',
    },
  ];

  // Test 1: Validates the rendering of the main section and its primary heading.
  it('should render the main section with the correct accessible name from its heading', () => {
    // Test Purpose: To ensure the FeaturesSection component renders as a distinct landmark region
    // with an accessible name derived from its H2 heading. This is crucial for assistive technologies.
    // Business Context: The "How it works" (So funktioniert’s) section is a key part of the user journey,
    // explaining the app's core functionality. Its correct rendering and accessibility are paramount.
    render(<FeaturesSection />);

    // Verify the section exists as a landmark region, named by its H2 heading.
    // The text "So funktioniert’s" translates to "How it works".
    const sectionElement = screen.getByRole('region', { name: /So funktioniert’s/i });
    expect(sectionElement).toBeInTheDocument();
    // Check for the specific class name used for styling.
    expect(sectionElement).toHaveClass('home-features-section');

    // Also, explicitly verify the H2 heading itself.
    const headingElement = screen.getByRole('heading', { name: /So funktioniert’s/i, level: 2 });
    expect(headingElement).toBeInTheDocument();
  });

  // Test Group 2: Focuses on the display and content of individual feature items.
  describe('Feature Items Display', () => {
    // Iterate through each defined feature to test its rendering.
    features.forEach((feature, index) => {
      it(`should render feature item ${index + 1} ("${feature.imgAltRegex.source}") correctly with its image, heading, and description`, () => {
        // Test Purpose: To confirm that each feature (e.g., "Create weekly plan") is displayed
        // with its corresponding image, title, and descriptive text.
        // Business Context: Each feature highlights a core value proposition of the application.
        // Accurate presentation is vital for communicating these benefits to users.
        render(<FeaturesSection />);

        // Check for the feature image using its alt text.
        const imgElement = screen.getByAltText(feature.imgAltRegex);
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', feature.imgSrcFilename); // Check mock path

        // Check for the feature heading (H3).
        const headingElement = screen.getByRole('heading', { name: feature.headingRegex, level: 3 });
        expect(headingElement).toBeInTheDocument();

        // Check for the feature description paragraph.
        const descriptionElement = screen.getByText(feature.descriptionRegex);
        expect(descriptionElement).toBeInTheDocument();
      });
    });

    // Test 2.1: Validates the overall grid structure containing all feature items.
    it('should correctly render all feature items within the designated grid container', () => {
      // Test Purpose: To verify that all feature items are rendered and are structurally
      // grouped within the main features grid (`.home-features-grid`).
      // Business Context: This ensures the layout integrity of the features section,
      // presenting information in a clear, organized, and visually appealing manner as designed.
      render(<FeaturesSection />);

      // Attempt to find the grid container. One robust way is by finding an element
      // known to be inside a feature item, then traversing up to the grid.
      const firstFeatureDescription = screen.getByText(features[0].descriptionRegex);
      const gridElement = firstFeatureDescription.closest('.home-features-grid');
      expect(gridElement).toBeInTheDocument();

      // If the grid element is found, check that it contains the correct number of feature items.
      // Each feature item is expected to be a div with class "home-feature".
      if (gridElement) {
        const featureItemElements = gridElement.querySelectorAll('div.home-feature');
        expect(featureItemElements.length).toBe(features.length);

        // Additionally, confirm that each feature's heading is indeed a descendant of this grid.
        features.forEach(featureData => {
          const heading = screen.getByRole('heading', { name: featureData.headingRegex, level: 3 });
          expect(gridElement.contains(heading)).toBe(true);
        });
      }
    });
  });

  // Test 3: Focuses on accessibility, specifically the alt text for images.
  it('should provide descriptive alt text for all feature images, enhancing accessibility', () => {
    // Test Purpose: To explicitly confirm that all images illustrating features have
    // appropriate alternative text, which is crucial for users relying on screen readers.
    // Business Context: Adherence to accessibility standards (like WCAG) improves usability
    // for all users, including those with disabilities, and can also positively impact SEO.
    render(<FeaturesSection />);

    // Verify each feature's image has the expected alt text.
    features.forEach(feature => {
      const imgElement = screen.getByAltText(feature.imgAltRegex);
      expect(imgElement).toBeInTheDocument();
    });

    // As a sanity check, ensure the total count of images with any alt text matches the number of features.
    // This helps catch scenarios where extra, unintended images might be rendered.
    const allImagesWithAltText = screen.getAllByRole('img').filter(img => img.hasAttribute('alt') && img.getAttribute('alt') !== '');
    expect(allImagesWithAltText.length).toBe(features.length);
  });

  // General Note on Coverage:
  // The FeaturesSection component is primarily presentational. It does not currently involve
  // complex props, state management, user interactions leading to side effects, or intricate conditional logic.
  // The tests above cover its rendering, content accuracy, structure, and key accessibility aspects.
  // Should the component evolve to include more dynamic behavior, further tests (e.g., for event handling,
  // prop variations, API interactions) would be necessary.
});
