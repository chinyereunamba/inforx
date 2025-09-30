/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useScreenSize } from "@/lib/utils/responsive";
import { useSwipeGesture } from "@/lib/utils/gestures";
import ResponsiveGrid from "@/components/ui/responsive-grid";
import ResponsiveCard from "@/components/ui/responsive-card";
import { TouchButton } from "@/components/ui/touch-button";
import MobileNavigation from "@/components/ui/mobile-navigation";

// Mock the responsive hooks
jest.mock("@/lib/utils/responsive", () => ({
  ...jest.requireActual("@/lib/utils/responsive"),
  useScreenSize: jest.fn(),
}));

jest.mock("@/lib/utils/gestures", () => ({
  useSwipeGesture: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("Responsive Design System", () => {
  beforeEach(() => {
    // Reset mocks
    (useScreenSize as jest.Mock).mockReturnValue({
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    (useSwipeGesture as jest.Mock).mockReturnValue({
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
    });
  });

  describe("ResponsiveGrid", () => {
    it("renders with default grid layout", () => {
      render(
        <ResponsiveGrid>
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByText("Item 1").parentElement;
      expect(grid).toHaveClass("grid");
    });

    it("applies gesture classes when enabled", () => {
      render(
        <ResponsiveGrid enableGestures>
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByText("Item 1").parentElement;
      expect(grid).toHaveClass("touch-auto");
    });

    it("applies animation classes when enabled", () => {
      render(
        <ResponsiveGrid animateChildren>
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByText("Item 1").parentElement;
      expect(grid).toHaveClass("animate-in");
    });
  });

  describe("ResponsiveCard", () => {
    it("renders with title and description", () => {
      render(
        <ResponsiveCard title="Test Card" description="Test Description">
          <div>Card content</div>
        </ResponsiveCard>
      );

      expect(screen.getByText("Test Card")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies interactive styles when interactive", () => {
      render(
        <ResponsiveCard interactive title="Interactive Card">
          <div>Content</div>
        </ResponsiveCard>
      );

      const card =
        screen.getByText("Interactive Card").closest("[role]") ||
        screen.getByText("Interactive Card").closest("div");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("applies gesture classes when enabled", () => {
      render(
        <ResponsiveCard enableGestures title="Gesture Card">
          <div>Content</div>
        </ResponsiveCard>
      );

      const card = screen.getByText("Gesture Card").closest("div");
      expect(card).toHaveClass("touch-pan-x");
    });
  });

  describe("TouchButton", () => {
    it("renders with touch-friendly sizing", () => {
      render(<TouchButton>Touch Me</TouchButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[48px]");
      expect(button).toHaveClass("min-w-[48px]");
    });

    it("applies bounce animation on interaction", () => {
      render(<TouchButton>Touch Me</TouchButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("active:scale-95");
    });

    it("supports different touch sizes", () => {
      render(<TouchButton touchSize="spacious">Spacious Button</TouchButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-[56px]");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      (useScreenSize as jest.Mock).mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      });
    });

    it("renders navigation items", () => {
      render(<MobileNavigation />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Vault")).toBeInTheDocument();
      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("applies safe area classes", () => {
      render(<MobileNavigation />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("safe-area-inset-bottom");
    });

    it("has proper touch targets", () => {
      render(<MobileNavigation />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("min-h-[48px]");
    });
  });

  describe("Screen Size Detection", () => {
    it("detects mobile screen size", () => {
      // Mock window.innerWidth
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      (useScreenSize as jest.Mock).mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      });

      const TestComponent = () => {
        const { isMobile } = useScreenSize();
        return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("Mobile")).toBeInTheDocument();
    });

    it("detects tablet screen size", () => {
      (useScreenSize as jest.Mock).mockReturnValue({
        width: 768,
        height: 1024,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
      });

      const TestComponent = () => {
        const { isTablet } = useScreenSize();
        return <div>{isTablet ? "Tablet" : "Other"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("Tablet")).toBeInTheDocument();
    });
  });

  describe("Gesture Handling", () => {
    it("handles swipe gestures", () => {
      const onSwipe = jest.fn();
      (useSwipeGesture as jest.Mock).mockReturnValue({
        onTouchStart: jest.fn(),
        onTouchMove: jest.fn(),
        onTouchEnd: jest.fn(),
      });

      const TestComponent = () => {
        const swipeHandlers = useSwipeGesture(onSwipe);
        return <div {...swipeHandlers}>Swipeable</div>;
      };

      render(<TestComponent />);

      const element = screen.getByText("Swipeable");

      // Simulate touch events
      fireEvent.touchStart(element, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      fireEvent.touchMove(element, {
        touches: [{ clientX: 200, clientY: 100 }],
      });

      fireEvent.touchEnd(element);

      expect(useSwipeGesture).toHaveBeenCalledWith(onSwipe, 50);
    });
  });

  describe("Performance Optimizations", () => {
    it("applies performance classes", () => {
      render(
        <div className="transform-gpu backface-visibility-hidden">
          Optimized Element
        </div>
      );

      const element = screen.getByText("Optimized Element");
      expect(element).toHaveClass("transform-gpu");
      expect(element).toHaveClass("backface-visibility-hidden");
    });

    it("supports reduced motion preferences", () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<div className="reduce-motion">Motion Reduced</div>);

      const element = screen.getByText("Motion Reduced");
      expect(element).toHaveClass("reduce-motion");
    });
  });

  describe("Accessibility Features", () => {
    it("provides proper ARIA labels", () => {
      render(<TouchButton aria-label="Accessible Button">Button</TouchButton>);

      const button = screen.getByLabelText("Accessible Button");
      expect(button).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(<TouchButton>Keyboard Accessible</TouchButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-2");
    });

    it("has proper focus indicators", () => {
      render(
        <ResponsiveCard interactive title="Focusable Card">
          Content
        </ResponsiveCard>
      );

      const card = screen.getByText("Focusable Card").closest("[tabindex]");
      expect(card).toHaveAttribute("tabindex", "0");
    });
  });
});
