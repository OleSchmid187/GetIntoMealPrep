import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "./Home";

// Mock child components to isolate testing to the Home component itself.
// This prevents tests from breaking if a child component has an issue and speeds up test execution.
vi.mock("./HeroSection/HeroSection", () => ({
  default: () => <div data-testid="hero-section">Mocked HeroSection</div>,
}));

vi.mock("./FeatureSection/FeatureSection", () => ({
  default: () => <div data-testid="features-section">Mocked FeaturesSection</div>,
}));

vi.mock("./CTASection/CTASection", () => ({
  default: () => <div data-testid="cta-section">Mocked CTASection</div>,
}));

describe("Home Component", () => {
  // Test Case: Verifies that the Home component renders without crashing and its main container is present.
  // Context: This is a basic smoke test to ensure the component initializes correctly.
  it("should render the main home container", () => {
    render(<Home />);
    // Check if the main container div with data-testid 'home-container' is rendered.
    const homeContainer = screen.getByTestId("home-container");
    expect(homeContainer).toBeInTheDocument();
    expect(homeContainer).toHaveClass("home-container");
  });

  // Test Case: Verifies that the HeroSection component is rendered within the Home component.
  // Context: Ensures that the Home component correctly includes the HeroSection, which is critical for the page's initial impact.
  it("should render the HeroSection component", () => {
    render(<Home />);
    // Check if the mocked HeroSection is present in the document.
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByText("Mocked HeroSection")).toBeInTheDocument();
  });

  // Test Case: Verifies that the FeaturesSection component is rendered within the Home component.
  // Context: Ensures that the Home component correctly includes the FeaturesSection, which highlights key product/service features.
  it("should render the FeaturesSection component", () => {
    render(<Home />);
    // Check if the mocked FeaturesSection is present in the document.
    expect(screen.getByTestId("features-section")).toBeInTheDocument();
    expect(screen.getByText("Mocked FeaturesSection")).toBeInTheDocument();
  });

  // Test Case: Verifies that the CTASection component is rendered within the Home component.
  // Context: Ensures that the Home component correctly includes the CTASection, which is vital for user conversion.
  it("should render the CTASection component", () => {
    render(<Home />);
    // Check if the mocked CTASection is present in the document.
    expect(screen.getByTestId("cta-section")).toBeInTheDocument();
    expect(screen.getByText("Mocked CTASection")).toBeInTheDocument();
  });

  // Test Case: Verifies that all primary child components are rendered together.
  // Context: This integration-like test ensures the Home component orchestrates the display of all its main sections as expected.
  it("should render all child section components", () => {
    render(<Home />);
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("features-section")).toBeInTheDocument();
    expect(screen.getByTestId("cta-section")).toBeInTheDocument();
  });
});
