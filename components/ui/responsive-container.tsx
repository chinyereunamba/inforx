"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { containers, responsiveSpacing } from "@/lib/utils/responsive";

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: keyof typeof containers;
  spacing?: keyof typeof responsiveSpacing;
  className?: string;
  as?: "div" | "section" | "main" | "article";
}

export default function ResponsiveContainer({
  children,
  size = "constrained",
  spacing = "md",
  className,
  as: Component = "div",
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(containers[size], responsiveSpacing[spacing], className)}
    >
      {children}
    </Component>
  );
}
