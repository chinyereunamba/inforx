/**
 * Responsive Design Utilities
 * Mobile-first responsive design helpers and breakpoint management
 */

import { useState, useEffect } from "react";

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current screen size
 */
export const useScreenSize = () => {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };
  }

  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < breakpoints.md,
    isTablet:
      screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg,
    isDesktop: screenSize.width >= breakpoints.lg,
  };
};

/**
 * Media query utilities
 */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${
    breakpoints.lg - 1
  }px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  touch: "(hover: none) and (pointer: coarse)",
  hover: "(hover: hover) and (pointer: fine)",
} as const;

/**
 * Touch-friendly sizing utilities
 */
export const touchTargets = {
  minimum: "min-h-[44px] min-w-[44px]", // iOS minimum
  comfortable: "min-h-[48px] min-w-[48px]", // Android minimum
  spacious: "min-h-[56px] min-w-[56px]", // Material Design
} as const;

/**
 * Responsive spacing utilities
 */
export const responsiveSpacing = {
  xs: "p-2 sm:p-3 md:p-4",
  sm: "p-3 sm:p-4 md:p-6",
  md: "p-4 sm:p-6 md:p-8",
  lg: "p-6 sm:p-8 md:p-12",
  xl: "p-8 sm:p-12 md:p-16",
} as const;

/**
 * Responsive text sizing
 */
export const responsiveText = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base",
  base: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
  xl: "text-xl sm:text-2xl",
  "2xl": "text-2xl sm:text-3xl md:text-4xl",
  "3xl": "text-3xl sm:text-4xl md:text-5xl",
} as const;

/**
 * Responsive grid utilities
 */
export const responsiveGrid = {
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  cards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  dashboard: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
  form: "grid-cols-1 md:grid-cols-2",
} as const;

/**
 * Mobile navigation utilities
 */
export const mobileNav = {
  height: "h-16 sm:h-20",
  padding: "px-4 sm:px-6 lg:px-8",
  spacing: "space-x-4 sm:space-x-6 lg:space-x-8",
} as const;

/**
 * Check if device supports hover
 */
export const supportsHover = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover)").matches;
};

/**
 * Check if device is touch-enabled
 */
export const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * Responsive container utilities
 */
export const containers = {
  full: "w-full",
  constrained: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  narrow: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  content: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
} as const;

/**
 * Mobile gesture utilities
 */
export const gestureClasses = {
  swipeable: "touch-pan-x select-none",
  draggable: "touch-none select-none",
  scrollable: "touch-auto overflow-auto",
  pinchZoom: "touch-pinch-zoom",
} as const;

/**
 * Performance optimization classes for mobile
 */
export const performanceClasses = {
  willChange: "will-change-transform",
  transform3d: "transform-gpu",
  backfaceHidden: "backface-visibility-hidden",
  optimizeSpeed: "rendering-optimizeSpeed",
} as const;

/**
 * Safe area utilities for mobile devices
 */
export const safeAreaClasses = {
  top: "pt-safe-top",
  bottom: "pb-safe-bottom",
  left: "pl-safe-left",
  right: "pr-safe-right",
  insetTop: "safe-area-inset-top",
  insetBottom: "safe-area-inset-bottom",
} as const;

/**
 * Mobile-optimized animation utilities
 */
export const mobileAnimations = {
  fastTransition: "transition-all duration-150 ease-out",
  mediumTransition: "transition-all duration-200 ease-out",
  slowTransition: "transition-all duration-300 ease-out",
  bounceScale: "active:scale-95 transition-transform duration-150",
  fadeIn: "animate-in fade-in duration-200",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
} as const;
