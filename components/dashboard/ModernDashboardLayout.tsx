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
  ChevronDown,
  Home,
  FileText,
  Upload,
  BarChart3,
  Heart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
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
    label: "Recent Activity",
    href: "/dashboard/activity",
    icon: Activity,
    description: "Track your health journey",
  },
];

export default function ModernDashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("inforx-theme");
    const prefersDark = savedTheme === "dark" || 
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      
    if (prefersDark) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Log user login event if user just arrived
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.LOGIN, {
        theme: prefersDark ? 'dark' : 'light',
        device: window.innerWidth < 768 ? 'mobile' : 'desktop'
      });
    }
  }, []);

  // Sidebar animations
  useEffect(() => {
    if (sidebarOpen) {
      gsap.fromTo(
        sidebarRef.current,
        { x: "-100%" },
        { x: "0%", duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    }
  }, [sidebarOpen]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
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
        theme: darkMode ? 'dark' : 'light',
        session_duration: Math.floor((new Date().getTime() - new Date(user.last_sign_in_at || 0).getTime()) / 1000)
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
        page: route.replace("/dashboard/", "").replace("/", "")
      });
    }
  };

  const handleSidebarClose = () => {
    if (sidebarOpen) {
      gsap.to(sidebarRef.current, {
        x: "-100%",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => setSidebarOpen(false),
      });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleSidebarClose}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 w-72 h-full flex flex-col justify-between bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl lg:shadow-none transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-noto text-slate-900 dark:text-white">
                  InfoRx
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Healthcare AI
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarClose}
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) handleSidebarClose();
                    handleNavigationClick(item.href);
                  }}
                  className={`group flex items-center gap-3 px-3 py-3 text-slate-700 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "border-teal-600 border-2 shadow-lg"
                      : " dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-sky-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400
                        }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate 
                          text-slate-500 dark:text-slate-400
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.user_metadata?.full_name?.[0] ||
                  user?.email?.[0]?.toUpperCase()}
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
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Page Title - Hide on mobile */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {navigationItems.find((item) => isActiveRoute(item.href))
                  ?.label || "Dashboard"}
              </h2>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}