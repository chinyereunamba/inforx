"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  responsiveGrid,
  gestureClasses,
  mobileAnimations,
} from "@/lib/utils/responsive";

interface ResponsiveGridProps {
  children: ReactNode;
  variant?: keyof typeof responsiveGrid;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  enableGestures?: boolean;
  animateChildren?: boolean;
}

const gapClasses = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
  xl: "gap-8 sm:gap-10",
};

export default function ResponsiveGrid({
  children,
  variant = "auto",
  gap = "md",
  className,
  enableGestures = false,
  animateChildren = false,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid",
        responsiveGrid[variant],
        gapClasses[gap],
        enableGestures && gestureClasses.scrollable,
        animateChildren && mobileAnimations.fadeIn,
        className
      )}
    >
      {children}
    </div>
  );
}
