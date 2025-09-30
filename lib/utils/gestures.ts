/**
 * Gesture Utilities
 * Advanced touch and gesture handling for mobile devices
 */

import { useEffect, useRef, useState } from "react";

export interface SwipeDirection {
  x: number;
  y: number;
  direction: "left" | "right" | "up" | "down" | null;
}

export interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Hook for handling swipe gestures
 */
export function useSwipeGesture(
  onSwipe?: (direction: SwipeDirection) => void,
  threshold: number = 50
) {
  const [startTouch, setStartTouch] = useState<TouchPosition | null>(null);
  const [currentTouch, setCurrentTouch] = useState<TouchPosition | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setStartTouch({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    setCurrentTouch({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!startTouch || !currentTouch) return;

    const deltaX = currentTouch.x - startTouch.x;
    const deltaY = currentTouch.y - startTouch.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > threshold || absDeltaY > threshold) {
      let direction: "left" | "right" | "up" | "down" | null = null;

      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      onSwipe?.({
        x: deltaX,
        y: deltaY,
        direction,
      });
    }

    setStartTouch(null);
    setCurrentTouch(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Hook for handling long press gestures
 */
export function useLongPress(onLongPress: () => void, delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isPressed, setIsPressed] = useState(false);

  const start = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
    }, delay);
  };

  const clear = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    isPressed,
  };
}

/**
 * Hook for handling pinch-to-zoom gestures
 */
export function usePinchZoom(
  onZoom?: (scale: number) => void,
  minScale: number = 0.5,
  maxScale: number = 3
) {
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const newScale = Math.max(
        minScale,
        Math.min(maxScale, scale * (currentDistance / initialDistance))
      );
      setScale(newScale);
      onZoom?.(newScale);
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    scale,
    resetScale: () => setScale(1),
  };
}

/**
 * Hook for handling drag gestures
 */
export function useDragGesture(
  onDrag?: (position: TouchPosition) => void,
  onDragEnd?: () => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState<TouchPosition | null>(
    null
  );

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging && startPosition) {
      const position = {
        x: clientX - startPosition.x,
        y: clientY - startPosition.y,
      };
      onDrag?.(position);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setStartPosition(null);
    onDragEnd?.();
  };

  return {
    onTouchStart: (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    onTouchMove: (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    onTouchEnd: handleEnd,
    onMouseDown: (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    },
    onMouseMove: (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    onMouseUp: handleEnd,
    isDragging,
  };
}

/**
 * Utility to prevent default touch behaviors
 */
export const preventDefaultTouch = (e: TouchEvent) => {
  e.preventDefault();
};

/**
 * Utility to check if device supports touch
 */
export const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Utility to get optimal touch target size based on device
 */
export const getOptimalTouchSize = () => {
  const userAgent = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 44; // iOS minimum
  } else if (/Android/.test(userAgent)) {
    return 48; // Android minimum
  }

  return 44; // Default minimum
};
