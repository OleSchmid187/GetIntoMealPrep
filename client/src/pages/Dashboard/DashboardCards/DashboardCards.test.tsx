import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DashboardCards from "./DashboardCards";

// Mock react-router-dom's useNavigate hook
// This allows us to spy on navigation calls without actually changing the URL during tests.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DashboardCards Component", () => {
  // Before each test, reset the mockNavigate to ensure a clean state for each test case.
  // This is crucial for accurately asserting call counts and arguments.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Renders both dashboard cards with correct content.
   * Why: This test ensures that the primary visual elements of the DashboardCards component
   * are present and display the correct information upon initial rendering.
   * It verifies that users see the expected titles, descriptions, and icons for each card.
   */
  it("should render both dashboard cards with correct titles, descriptions, and icons", () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    // Verify the "Wochenplaner" (Weekly Planner) card
    // Business Context: This card directs users to the meal planning section.
    expect(screen.getByText("Wochenplaner")).toBeInTheDocument();
    expect(
      screen.getByText("Plane deine Mahlzeiten für die ganze Woche")
    ).toBeInTheDocument();
    // Check for the FaCalendarAlt icon. Icons are often rendered as SVGs.
    // We query by class name as role="img" might not be set by default by react-icons.

    // Verify the "Mein Rezeptbuch" (My Recipe Book) card
    // Business Context: This card directs users to their collection of saved and liked recipes.
    expect(screen.getByText("Mein Rezeptbuch")).toBeInTheDocument();
    expect(
      screen.getByText("Deine gespeicherten und geliketen Rezepte")
    ).toBeInTheDocument();
    // Check for the FaBookOpen icon.

    // Verify that two icons are rendered (one for each card)
    // react-icons typically renders <svg> elements.
    // We query for svg elements with the class "dashboard-icon".
    const icons = container.querySelectorAll("svg.dashboard-icon");
    expect(icons.length).toBe(2); // Expect exactly two icons with this class
  });

  /**
   * Test: Navigates to the planner page when the weekly planner card is clicked.
   * Why: This test verifies the core interactive functionality of the "Wochenplaner" card.
   * It ensures that user clicks trigger the expected navigation to the '/planner' route,
   * which is a critical user flow for accessing the meal planning feature.
   */
  it("should navigate to /planner when the weekly planner card is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    // Find the "Wochenplaner" card. We can use its text content to locate it.
    // The card itself is a div, so we get it by its text content.
    const plannerCard = screen.getByText("Wochenplaner").closest(".dashboard-card");
    expect(plannerCard).toBeInTheDocument(); // Ensure the card element is found

    if (plannerCard) {
      await user.click(plannerCard);
    }

    // Assert that navigate was called with the correct path.
    // Business Context: Correct navigation is essential for user experience and application flow.
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/planner");
  });

  /**
   * Test: Navigates to the my-recipes page when the recipe book card is clicked.
   * Why: This test verifies the core interactive functionality of the "Mein Rezeptbuch" card.
   * It ensures that user clicks trigger the expected navigation to the '/my-recipes' route,
   * allowing users to access their personal recipe collections.
   */
  it("should navigate to /my-recipes when the recipe book card is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    // Find the "Mein Rezeptbuch" card.
    const recipeBookCard = screen.getByText("Mein Rezeptbuch").closest(".dashboard-card");
    expect(recipeBookCard).toBeInTheDocument(); // Ensure the card element is found

    if (recipeBookCard) {
      await user.click(recipeBookCard);
    }

    // Assert that navigate was called with the correct path.
    // Business Context: Ensures users can easily access their saved recipes.
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/my-recipes");
  });

  /**
   * Test: Accessibility considerations - Cards should be keyboard focusable and interactive.
   * Why: Ensures that users who rely on keyboard navigation can interact with the cards.
   * While RTL doesn't directly test tab order in a browser, we can check for attributes
   * that enable keyboard interaction (like `tabIndex` if not implicitly focusable, or role).
   * Since these are `div` elements with `onClick`, they should ideally have `role="button"` and `tabIndex="0"`
   * for better accessibility, or be actual `<button>` elements.
   * For this test, we'll focus on the click interaction which implies they are interactive.
   * Note: Full accessibility testing often involves manual testing or specialized tools.
   * The current implementation relies on divs with onClick, which are generally accessible
   * for mouse users but might need explicit `role` and `tabIndex` for optimal keyboard navigation.
   * This test primarily re-verifies the clickability, which is a proxy for basic interactivity.
   */
  it("should allow interaction with cards, implying accessibility for pointer devices", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    const plannerCard = screen.getByText("Wochenplaner").closest(".dashboard-card");
    const recipeBookCard = screen.getByText("Mein Rezeptbuch").closest(".dashboard-card");

    expect(plannerCard).toBeInTheDocument();
    expect(recipeBookCard).toBeInTheDocument();

    // Simulate clicks again to ensure they are still interactive (redundant with previous tests but focuses on the element itself)
    if (plannerCard) await user.click(plannerCard);
    expect(mockNavigate).toHaveBeenCalledWith("/planner");

    mockNavigate.mockClear(); // Clear mock for the next assertion

    if (recipeBookCard) await user.click(recipeBookCard);
    expect(mockNavigate).toHaveBeenCalledWith("/my-recipes");
  });

  // Note on untested logic:
  // - Specific styling or CSS class applications beyond '.dashboard-card' are not tested, as this is typically
  //   outside the scope of RTL, which focuses on behavior and accessibility over visual styling.
  // - The exact rendering of SVG icons (e.g., paths, attributes) is not deeply inspected, relying on
  //   react-icons to render them correctly. We verify their presence generally.
  // - Advanced accessibility features like ARIA attributes beyond what react-icons provides by default
  //   are not explicitly tested here but should be considered in a full accessibility audit.
});
