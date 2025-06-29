"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Search,
  BarChart3,
  Settings,
  Info,
  User,
  LogOut,
  Plus,
  FileText,
} from "lucide-react";
import { signOut } from "@/app/(auth)/auth/auth";
import { User as UserType } from "@supabase/supabase-js";

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

const navigationItems = [
  {
    id: "interpreter",
    label: "Interpreter",
    icon: Search,
    href: "/dashboard",
    description: "AI-powered medical document analysis",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard?tab=dashboard",
    description: "Overview and analytics",
  },
  {
    id: "medical-records",
    label: "Medical Records",
    icon: FileText,
    href: "/dashboard/records",
    description: "Manage your medical documents",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?tab=settings",
    description: "Account and preferences",
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    href: "/about",
    description: "Learn more about InfoRx",
  },
];

export default function NavigationSidebar({
  isOpen,
  onClose,
  user,
}: NavigationSidebarProps) { 
  const { signOut } = useAuthStore();
  const sidebarRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement[]>([]);
  const userSectionRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(); 
      // The auth state change will automatically redirect to login
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Determine if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" && !pathname.includes("?tab=");
    }
    if (href.includes("?tab=")) {
      const tab = href.split("=")[1];
      return pathname === "/dashboard" && pathname.includes(`?tab=${tab}`);
    }
    return pathname === href;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isOpen) {
        // Sidebar entrance animation
        gsap.fromTo(
          sidebarRef.current,
          { x: "-100%" },
          { x: "0%", duration: 0.3, ease: "power2.out", overwrite: true }
        );

        // Staggered content animation
        const tl = gsap.timeline({ delay: 0.1 });
        tl.fromTo(
          logoRef.current,
          { opacity: 0, y: -20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          }
        )
          .fromTo(
            navItemsRef.current,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              stagger: 0.1,
              ease: "power2.out",
              overwrite: true,
            },
            "-=0.2"
          )
          .fromTo(
            userSectionRef.current,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              overwrite: true,
            },
            "-=0.2"
          );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, [isOpen]);

  const MedicalCrossIcon = () => (
    <svg
      className="w-8 h-8 text-blue-600"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 8h-2V6a2 2 0 0 0-2-2h-2V2a2 2 0 0 0-4 0v2H7a2 2 0 0 0-2 2v2H3a2 2 0 0 0 0 4h2v2a2 2 0 0 0 2 2h2v2a2 2 0 0 0 4 0v-2h2a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 0-4zM15 14h-2v2a2 2 0 0 1-4 0v-2H7v-2a2 2 0 0 1 0-4h2V6a2 2 0 0 1 4 0v2h2v2a2 2 0 0 1 0 4z" />
    </svg>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        data-sidebar
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div
            ref={logoRef}
            className="flex items-center gap-3 p-6 border-b border-gray-100"
          >
            <MedicalCrossIcon />
            <div>
              <h1 className="text-xl font-bold font-noto text-gray-900">InfoRx</h1>
              <p className="text-sm text-gray-500">Healthcare AI</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2" role="menubar">
            {navigationItems.map((item, index) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) navItemsRef.current[index] = el;
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm"
                    }`}
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                    title={item.description}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-colors duration-200 ${
                        active
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block">{item.label}</span>
                      <span className="text-xs text-gray-500 truncate hidden group-hover:block">
                        {item.description}
                      </span>
                    </div>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* User Section */}
          <div ref={userSectionRef} className="p-4 border-t border-gray-100">
            {/* Quick Actions */}
            <div className="mb-4">
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 group"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Analysis</span>
              </Link>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close navigation menu"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </aside>
    </>
  );
}
