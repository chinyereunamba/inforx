"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  responsiveSpacing,
  mobileAnimations,
  gestureClasses,
} from "@/lib/utils/responsive";

interface ResponsiveCardProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  spacing?: keyof typeof responsiveSpacing;
  interactive?: boolean;
  enableGestures?: boolean;
  animateOnHover?: boolean;
}

export default function ResponsiveCard({
  children,
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  spacing = "sm",
  interactive = false,
  enableGestures = false,
  animateOnHover = false,
}: ResponsiveCardProps) {
  return (
    <Card
      className={cn(
        mobileAnimations.mediumTransition,
        interactive && [
          "hover:shadow-md hover:shadow-slate-200/50",
          "dark:hover:shadow-slate-800/50",
          "cursor-pointer touch-manipulation",
          "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        ],
        interactive && mobileAnimations.bounceScale,
        enableGestures && gestureClasses.swipeable,
        animateOnHover && "hover:scale-[1.02]",
        className
      )}
      tabIndex={interactive ? 0 : undefined}
    >
      {(title || description) && (
        <CardHeader className={cn("pb-3 sm:pb-4", headerClassName)}>
          {title && (
            <CardTitle className="text-lg sm:text-xl font-semibold">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm sm:text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent
          className={cn(
            responsiveSpacing[spacing],
            title || description ? "pt-0" : "",
            contentClassName
          )}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
}
