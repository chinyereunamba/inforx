/**
 * Mobile Performance Optimization Utilities
 * Utilities for optimizing performance on mobile devices
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy loading utility for images
 */
export function setupLazyLoading() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || "";
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  // Preload critical fonts
  const fontLinks = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap",
  ];

  fontLinks.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Optimize scroll performance
 */
export function optimizeScrollPerformance() {
  let ticking = false;

  function updateScrollPosition() {
    // Add scroll-based optimizations here
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
}

/**
 * Reduce motion for users who prefer it
 */
export function respectReducedMotion() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty(
      "--animation-duration",
      "0.01ms"
    );
    document.documentElement.style.setProperty(
      "--transition-duration",
      "0.01ms"
    );
  }
}

/**
 * Optimize touch events for better performance
 */
export function optimizeTouchEvents() {
  // Add passive event listeners for better scroll performance
  const passiveEvents = ["touchstart", "touchmove", "wheel"];

  passiveEvents.forEach((event) => {
    document.addEventListener(event, () => {}, { passive: true });
  });
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static observers: IntersectionObserver[] = [];
  private static timeouts: NodeJS.Timeout[] = [];
  private static intervals: NodeJS.Timeout[] = [];

  static addObserver(observer: IntersectionObserver) {
    this.observers.push(observer);
  }

  static addTimeout(timeout: NodeJS.Timeout) {
    this.timeouts.push(timeout);
  }

  static addInterval(interval: NodeJS.Timeout) {
    this.intervals.push(interval);
  }

  static cleanup() {
    // Disconnect all observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }
}

/**
 * Battery API utilities for power-aware optimizations
 */
export async function getBatteryInfo() {
  if ("getBattery" in navigator) {
    try {
      // @ts-ignore
      const battery = await navigator.getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    } catch (error) {
      console.warn("Battery API not available:", error);
      return null;
    }
  }
  return null;
}

/**
 * Network-aware optimizations
 */
export function getNetworkInfo() {
  // @ts-ignore
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  return null;
}

/**
 * Initialize all mobile performance optimizations
 */
export function initializeMobilePerformance() {
  // Run optimizations when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupLazyLoading();
      preloadCriticalResources();
      optimizeScrollPerformance();
      respectReducedMotion();
      optimizeTouchEvents();
    });
  } else {
    setupLazyLoading();
    preloadCriticalResources();
    optimizeScrollPerformance();
    respectReducedMotion();
    optimizeTouchEvents();
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    MemoryManager.cleanup();
  });
}
