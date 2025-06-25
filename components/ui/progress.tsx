"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure value is a valid number between 0 and max
    const validValue = React.useMemo(() => {
      const numValue = typeof value === "number" ? value : 0;
      return Math.max(0, Math.min(max, numValue));
    }, [value, max]);

    const percentage = (validValue / max) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        role="progressbar"
        aria-valuenow={validValue}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
