"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { User } from "@supabase/supabase-js";
import { LoggingService } from "@/lib/services/logging-service";
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  Home,
  FileText,
  Upload,
  BarChart3,
  Heart,
  Activity,
  LogOut,
  User as UserIcon,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and insights",
  },
  {
    id: "interpreter",
    label: "AI Interpreter",
    href: "/dashboard/interpreter",
    icon: Heart,
    description: "Medical document analysis",
  },
  {
    id: "records",
    label: "Medical Records",
    href: "/dashboard/records",
    icon: FileText,
    badge: 3,
    description: "Manage your health records",
  },
  {
    id: "upload",
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
    description: "Add new documents",
  },
  {
    id: "analytics",
    label: "Health Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Health trends and insights",
  },
  {
    id: "activity",
    label: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
    description: "Track your health journey",
  },
];

export default function ModernDashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState(2);
  const [mounted, setMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  // Handle dark mode
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme after mounting to prevent hydration issues
  useEffect(() => {
    if (!mounted) return;

    const savedTheme = localStorage.getItem("inforx-theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (prefersDark) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
    }

    // Log user login event if user just arrived
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.LOGIN, {
        theme: prefersDark ? "dark" : "light",
        device: window.innerWidth < 768 ? "mobile" : "desktop",
      });
    }
  }, [mounted, user]);

  // Skip rendering until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Sidebar animations
  useEffect(() => {
    if (sidebarOpen && sidebarRef.current && overlayRef.current) {
      // Animate sidebar
      gsap.fromTo(
        sidebarRef.current,
        { x: "-100%" },
        { x: 0, duration: 0.3, ease: "power2.out" }
      );

      // Animate overlay
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    }
  }, [sidebarOpen]);

  const toggleTheme = () => {
    if (!mounted) return; // Prevent accessing localStorage/document before mounting

    const newDarkMode = !(darkMode ?? false);
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("inforx-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("inforx-theme", "light");
    }
  };

  const handleSignOut = async () => {
    if (user) {
      // Log sign out action before signing out
      await LoggingService.logAction(user, LoggingService.actions.LOGOUT, {
        theme: darkMode ?? false ? "dark" : "light",
        session_duration: Math.floor(
          (new Date().getTime() -
            new Date(user.last_sign_in_at || 0).getTime()) /
            1000
        ),
      });
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleNavigationClick = (route: string) => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: route.replace("/dashboard/", "").replace("/", ""),
      });
    }
    setSidebarOpen(false);
  };

  const handleSidebarClose = () => {
    if (sidebarOpen && sidebarRef.current && overlayRef.current) {
      // Animate sidebar out
      gsap.to(sidebarRef.current, {
        x: "-100%",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => setSidebarOpen(false),
      });

      // Fade out overlay
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        "bg-slate-50 text-slate-900",
        "dark:bg-slate-900 dark:text-white"
      )}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={handleSidebarClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col",
          "bg-white border-r border-slate-200",
          "dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/20",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={() => handleNavigationClick("/dashboard")}
            >
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-medium font-inter text-slate-900 dark:text-white">
                  InfoRx
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Healthcare Dashboard
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarClose}
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Search..."
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg",
                "bg-slate-100 border border-slate-200",
                "dark:bg-slate-700/50 dark:border-slate-600",
                "text-slate-900 placeholder-slate-500",
                "dark:text-white dark:placeholder-slate-400",
                "focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              )}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => handleNavigationClick(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg",
                      "transition-colors duration-200 group relative",
                      isActive
                        ? "bg-teal-600 text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent
                      className="h-5 w-5 flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium font-inter truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs truncate",
                          isActive
                            ? "text-white/80"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight
                        className="h-4 w-4 text-white/80 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Settings */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.user_metadata?.full_name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-[280px]">
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-30 py-2 px-4 sm:px-6",
            "bg-white border-b border-slate-200",
            "dark:bg-slate-800 dark:border-slate-700",
            "transition-colors duration-300"
          )}
        >
          <div className="flex items-center justify-between h-14">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </Button>

            {/* Page Title - Desktop */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-medium text-slate-900 dark:text-white font-inter">
                {navigationItems.find((item) => isActiveRoute(item.href))
                  ?.label || "Dashboard"}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
                aria-label={
                  darkMode ?? false
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {darkMode ?? false ? (
                  <Sun className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={1.5} />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg relative"
                aria-label={`${notifications} notifications`}
              >
                <Bell className="h-5 w-5" strokeWidth={1.5} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
                aria-label="Help and resources"
              >
                <HelpCircle className="h-5 w-5" strokeWidth={1.5} />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
                aria-label="User settings"
              >
                <Settings className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
