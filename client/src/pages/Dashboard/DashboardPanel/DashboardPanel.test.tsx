import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardPanel from "./DashboardPanel";

// Mock the child components to isolate testing to DashboardPanel.
// This ensures that tests for DashboardPanel focus on its own structure and composition,
// rather than the behavior or content of its children.
vi.mock("../DashboardCards/DashboardCards", () => ({
  default: () => <div data-testid="dashboard-cards">Mocked DashboardCards</div>,
}));

vi.mock("../DashboardStats/DashboardStats", () => ({
  default: () => <div data-testid="dashboard-stats">Mocked DashboardStats</div>,
}));

describe("DashboardPanel Component", () => {
  // Test Case: Verify that the DashboardPanel component renders its main container.
  // Purpose: This test ensures that the fundamental structure of the DashboardPanel is in place.
  // The 'dashboard-panel' class is crucial for styling and layout.
  it("should render the main dashboard panel container with the correct class", () => {
    render(<DashboardPanel />);
    // Select the main panel div using its data-testid.
    const panelElement = screen.getByTestId("dashboard-panel-container");
    
    // Assert that the element is in the document.
    expect(panelElement).toBeInTheDocument();
    // Assert that the element has the correct class name.
    expect(panelElement).toHaveClass("dashboard-panel");
  });

  // Test Case: Verify that the DashboardCards component is rendered within the DashboardPanel.
  // Purpose: This test confirms that DashboardPanel correctly includes and displays
  // the DashboardCards component, which is responsible for showing various informational cards.
  it("should render the DashboardCards component", () => {
    render(<DashboardPanel />);
    // Check for the placeholder text or data-testid of the mocked DashboardCards component.
    // This verifies that DashboardCards is part of DashboardPanel's output.
    expect(screen.getByTestId("dashboard-cards")).toBeInTheDocument();
    expect(screen.getByText("Mocked DashboardCards")).toBeInTheDocument();
  });

  // Test Case: Verify that the DashboardStats component is rendered within the DashboardPanel.
  // Purpose: This test confirms that DashboardPanel correctly includes and displays
  // the DashboardStats component, which is responsible for showing statistical data.
  it("should render the DashboardStats component", () => {
    render(<DashboardPanel />);
    // Check for the placeholder text or data-testid of the mocked DashboardStats component.
    // This verifies that DashboardStats is part of DashboardPanel's output.
    expect(screen.getByTestId("dashboard-stats")).toBeInTheDocument();
    expect(screen.getByText("Mocked DashboardStats")).toBeInTheDocument();
  });

  // Note on coverage:
  // This component is primarily a structural component that composes other components.
  // The tests above cover its rendering and the inclusion of its direct children.
  // There are no props, complex logic, state management, or user interactions
  // directly within DashboardPanel.tsx itself, so these tests provide high coverage
  // for its specific responsibilities. Further testing would be part of the
  // individual child components' test suites (DashboardCards.test.tsx, DashboardStats.test.tsx).
});
