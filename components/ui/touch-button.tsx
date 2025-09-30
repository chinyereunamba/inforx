"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  touchTargets,
  mobileAnimations,
  gestureClasses,
} from "@/lib/utils/responsive";
import { Button } from "./button";

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  touchSize?: keyof typeof touchTargets;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      touchSize = "comfortable",
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          touchTargets[touchSize],
          mobileAnimations.bounceScale,
          gestureClasses.swipeable,
          "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          "select-none touch-manipulation",
          className
        )}
        {...props}
      />
    );
  }
);

TouchButton.displayName = "TouchButton";

export { TouchButton };
