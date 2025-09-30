"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  touchTargets,
  mobileAnimations,
  safeAreaClasses,
} from "@/lib/utils/responsive";
import {
  Home,
  FileText,
  Brain,
  Activity,
  Settings,
  Vault,
  BarChart3,
} from "lucide-react";

interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

const mobileNavItems: MobileNavItem[] = [
  {
    id: "dashboard",
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    id: "vault",
    label: "Vault",
    href: "/dashboard/medical-vault",
    icon: Vault,
  },
  {
    id: "interpreter",
    label: "AI",
    href: "/dashboard/interpreter",
    icon: Brain,
  },
  {
    id: "activity",
    label: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-white/95 backdrop-blur-md border-t border-slate-200",
        "dark:bg-slate-800/95 dark:border-slate-700",
        safeAreaClasses.insetBottom,
        mobileAnimations.fadeIn
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative",
                "px-3 py-2 rounded-lg",
                touchTargets.comfortable,
                mobileAnimations.bounceScale,
                mobileAnimations.fastTransition,
                "active:bg-slate-100 dark:active:bg-slate-700",
                "touch-manipulation select-none",
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <IconComponent
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    isActive ? "scale-110" : "scale-100"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
