import { describe, it, expect, vi} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from './Footer';

describe('Footer Component', () => {
  describe('Content Rendering', () => {
    /**
     * Unit test: Verifies that the main application name is rendered correctly
     * in the footer. This ensures brand consistency and proper component structure.
     */
    it('should render the application name "GetIntoMealPrep"', () => {
      render(<Footer />);
      const appName = screen.getByRole('heading', { name: /getintomealprep/i });
      expect(appName).toBeInTheDocument();
      expect(appName.tagName).toBe('H4');
    });

    /**
     * Unit test: Verifies that the copyright notice displays the current year dynamically.
     * This test ensures the year updates automatically without manual intervention.
     */
    it('should render copyright with current year', () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      const copyright = screen.getByText(`© ${currentYear} – Alle Rechte vorbehalten`);
      expect(copyright).toBeInTheDocument();
    });

    /**
     * Unit test: Verifies that the copyright year is dynamically calculated.
     * This test mocks the Date constructor to ensure the component correctly
     * uses the current year rather than a hardcoded value.
     */
    it('should dynamically calculate and display the correct year', () => {
      const mockYear = 2025;
      const mockDate = new Date(`${mockYear}-01-01`);
      vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate);
      
      render(<Footer />);
      const copyright = screen.getByText(`© ${mockYear} – Alle Rechte vorbehalten`);
      expect(copyright).toBeInTheDocument();
      
      vi.restoreAllMocks();
    });

    /**
     * Unit test: Verifies that all required section headings are present.
     * This ensures proper information architecture and user navigation.
     */
    it('should render all section headings', () => {
      render(<Footer />);
      
      expect(screen.getByRole('heading', { name: /getintomealprep/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /links/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /folge uns/i })).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    /**
     * Unit test: Verifies that all legal and informational links are rendered.
     * These links are typically required for compliance and user information.
     */
    it('should render all legal and informational links', () => {
      render(<Footer />);
      
      expect(screen.getByRole('link', { name: /datenschutz/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /impressum/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /kontakt/i })).toBeInTheDocument();
    });

    /**
     * Unit test: Verifies that all social media links are present.
     * This ensures users can find and access the organization's social presence.
     */
    it('should render all social media links', () => {
      render(<Footer />);
      
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    });

    /**
     * Integration test: Verifies that links have the correct href attributes.
     * Even though these are placeholder links, this test ensures the structure
     * is correct for when real URLs are implemented.
     */
    it('should have correct href attributes for all links', () => {
      render(<Footer />);
      
      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
      });
    });
  });

  describe('User Interactions', () => {
    /**
     * Integration test: Simulates user clicking on legal links and verifies
     * they are interactive. This ensures proper event handling is in place
     * for future link implementations.
     */
    it('should handle clicks on legal links', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const datenschutzLink = screen.getByRole('link', { name: /datenschutz/i });
      const impressumLink = screen.getByRole('link', { name: /impressum/i });
      const kontaktLink = screen.getByRole('link', { name: /kontakt/i });
      
      // Verify links are clickable (no errors thrown)
      await user.click(datenschutzLink);
      await user.click(impressumLink);
      await user.click(kontaktLink);
      
      // Links should still be in the document after clicking
      expect(datenschutzLink).toBeInTheDocument();
      expect(impressumLink).toBeInTheDocument();
      expect(kontaktLink).toBeInTheDocument();
    });

    /**
     * Integration test: Simulates user clicking on social media links and verifies
     * they respond to user interaction. This ensures social links are properly
     * configured for user engagement.
     */
    it('should handle clicks on social media links', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const instagramLink = screen.getByRole('link', { name: /instagram/i });
      const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
      const githubLink = screen.getByRole('link', { name: /github/i });
      
      // Verify links are clickable (no errors thrown)
      await user.click(instagramLink);
      await user.click(linkedinLink);
      await user.click(githubLink);
      
      // Links should still be in the document after clicking
      expect(instagramLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    /**
     * Accessibility test: Verifies that the footer uses semantic HTML structure.
     * This ensures screen readers and other assistive technologies can properly
     * navigate and understand the footer content.
     */
    it('should use semantic footer element', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });

    /**
     * Accessibility test: Verifies that all headings follow proper hierarchy.
     * This ensures proper document structure for screen readers and SEO.
     */
    it('should have proper heading hierarchy', () => {
      render(<Footer />);
      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings).toHaveLength(3);
      
      headings.forEach(heading => {
        expect(heading.tagName).toBe('H4');
      });
    });

    /**
     * Accessibility test: Verifies that all links are accessible to screen readers.
     * This ensures users with assistive technologies can navigate all footer links.
     */
    it('should have accessible links with proper text content', () => {
      render(<Footer />);
      const allLinks = screen.getAllByRole('link');
      
      // Should have 6 links total (3 legal + 3 social)
      expect(allLinks).toHaveLength(6);
      
      // All links should have accessible text content
      allLinks.forEach(link => {
        expect(link).toHaveTextContent(/\S+/); // Non-empty text content
        expect(link).toBeVisible();
      });
    });

    /**
     * Accessibility test: Verifies that list structure is properly implemented.
     * This ensures screen readers can properly announce list information to users.
     */
    it('should use proper list structure for navigation items', () => {
      render(<Footer />);
      const lists = screen.getAllByRole('list');
      
      // Should have 2 lists (legal links and social links)
      expect(lists).toHaveLength(2);
      
      // Each list should contain the correct number of items
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(6); // 3 legal + 3 social
    });

    /**
     * Accessibility test: Verifies that the footer can be navigated using keyboard.
     * This ensures users who rely on keyboard navigation can access all footer links.
     */
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const firstLink = screen.getByRole('link', { name: /datenschutz/i });
      
      // Focus should be able to reach the first link
      await user.tab();
      // Continue tabbing until we reach footer links
      let activeElement = document.activeElement;
      let attempts = 0;
      while (activeElement !== firstLink && attempts < 10) {
        await user.tab();
        activeElement = document.activeElement;
        attempts++;
      }
      
      expect(document.activeElement).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('Component Structure', () => {
    /**
     * Unit test: Verifies that the footer has the correct CSS class structure.
     * This ensures styling can be properly applied and component can be identified.
     */
    it('should have correct CSS class structure', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const footerContent = footer.querySelector('.footer-content');
      const socialsList = footer.querySelector('.socials');
      
      expect(footer).toHaveClass('footer');
      expect(footerContent).toBeInTheDocument();
      expect(socialsList).toBeInTheDocument();
    });

    /**
     * Unit test: Verifies that the footer contains exactly three main sections.
     * This ensures the expected layout structure is maintained.
     */
    it('should contain exactly three main sections', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const footerContent = footer.querySelector('.footer-content');
      const sections = footerContent?.children;
      
      expect(sections).toHaveLength(3);
    });

    /**
     * Unit test: Verifies that each section contains the expected content structure.
     * This ensures consistent layout and proper content organization.
     */
    it('should have proper content structure in each section', () => {
      render(<Footer />);
      
      // First section: App name and copyright
      const appSection = screen.getByRole('heading', { name: /getintomealprep/i }).parentElement;
      expect(appSection?.children).toHaveLength(2); // h4 + p
      
      // Second section: Links heading and list
      const linksSection = screen.getByRole('heading', { name: /^links$/i }).parentElement;
      expect(linksSection?.children).toHaveLength(2); // h4 + ul
      
      // Third section: Social heading and list
      const socialSection = screen.getByRole('heading', { name: /folge uns/i }).parentElement;
      expect(socialSection?.children).toHaveLength(2); // h4 + ul
    });
  });
});
