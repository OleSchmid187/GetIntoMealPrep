import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardStats from './DashboardStats';

// Test suite for the DashboardStats component.
describe('DashboardStats Component', () => {
  // Test: Renders the main heading.
  it('should render the main heading', () => {
    render(<DashboardStats />);
    expect(screen.getByRole('heading', { name: /deine woche im überblick/i })).toBeInTheDocument();
  });

  // Test: Displays the average meal price.
  it('should display the average meal price', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/ø meal-preis:/i)).toBeInTheDocument();
    expect(screen.getByText('2,90 €')).toBeInTheDocument();
  });

  // Test: Displays prepared dishes stats and progress bar.
  it('should display prepared dishes statistics and progress bar', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/vorbereitete gerichte:/i)).toBeInTheDocument();
    const preparedDishesProgressBar = screen.getAllByRole('progressbar')[0];
    expect(preparedDishesProgressBar).toBeInTheDocument();
    expect(preparedDishesProgressBar).toHaveAttribute('aria-valuenow', '70');
    expect(screen.getByText('7 / 10')).toBeInTheDocument();
  });

  // Test: Displays nutritional goal stats and progress bar.
  it('should display nutritional goal statistics and progress bar', () => {
    render(<DashboardStats />);
    expect(screen.getByText(/nährwert-ziel \(kalorien pro tag\):/i)).toBeInTheDocument();
    const nutritionalGoalProgressBar = screen.getAllByRole('progressbar')[1];
    expect(nutritionalGoalProgressBar).toBeInTheDocument();
    expect(nutritionalGoalProgressBar).toHaveAttribute('aria-valuenow', '85');
    expect(screen.getByText('1700 kcal')).toBeInTheDocument();
  });

  // Test: Ensures progress bars are accessible.
  it('should have accessible progress bars', () => {
    render(<DashboardStats />);
    const progressBars = screen.getAllByRole('progressbar');

    // Check the first progress bar (Prepared Dishes)
    expect(progressBars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(progressBars[0]).toHaveAttribute('aria-valuemax', '100');
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '70');

    // Check the second progress bar (Nutritional Goal)
    expect(progressBars[1]).toHaveAttribute('aria-valuemin', '0');
    expect(progressBars[1]).toHaveAttribute('aria-valuemax', '100');
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '85');
  });
});
