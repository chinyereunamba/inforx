"use client";

import { useState, useEffect } from "react";
import NavigationSidebar from "./NavigationSidebar";
import type {
  DashboardState,
  InterpretationResult,
} from "@/lib/types/dashboard";
import { User } from "@supabase/supabase-js";

type DashboardProps = {
  children: React.ReactNode;
  user: User;
};

export default function DashboardLayout({ user, children }: DashboardProps) {
  const [state, setState] = useState<DashboardState>({
    activeTab: "interpreter",
    sidebarOpen: false,
    currentResult: null,
    isLoading: false,
    error: null,
  });

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.sidebarOpen) {
        setState((prev) => ({ ...prev, sidebarOpen: false }));
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.sidebarOpen]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        state.sidebarOpen &&
        !target.closest("[data-sidebar]") &&
        window.innerWidth < 1024
      ) {
        setState((prev) => ({ ...prev, sidebarOpen: false }));
      }
    };

    if (state.sidebarOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [state.sidebarOpen]);

  const toggleSidebar = () => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const setActiveTab = (tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const setResult = (result: InterpretationResult | null) => {
    setState((prev) => ({ ...prev, currentResult: result }));
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        isOpen={state.sidebarOpen}
        activeTab={state.activeTab}
        onTabChange={setActiveTab}
        onClose={() => setState((prev) => ({ ...prev, sidebarOpen: false }))}
        user={user}
      />

      {/* Mobile Sidebar Overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setState((prev) => ({ ...prev, sidebarOpen: false }))}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label="Open navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              InfoRx Dashboard
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
