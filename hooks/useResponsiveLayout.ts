"use client";

import { useState, useEffect } from "react";
import { useScreenSize } from "@/lib/utils/responsive";

interface ResponsiveLayoutConfig {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  showMobileNav: boolean;
  containerPadding: string;
  gridColumns: number;
}

export function useResponsiveLayout() {
  const { isMobile, isTablet, isDesktop, width } = useScreenSize();
  const [config, setConfig] = useState<ResponsiveLayoutConfig>({
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    showMobileNav: false,
    containerPadding: "p-4",
    gridColumns: 1,
  });

  useEffect(() => {
    const newConfig: ResponsiveLayoutConfig = {
      sidebarCollapsed: isMobile || isTablet,
      mobileMenuOpen: false,
      showMobileNav: isMobile,
      containerPadding: isMobile
        ? "p-3 sm:p-4"
        : isTablet
        ? "p-4 sm:p-6"
        : "p-6 sm:p-8",
      gridColumns: isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4,
    };

    setConfig(newConfig);
  }, [isMobile, isTablet, isDesktop, width]);

  const toggleMobileMenu = () => {
    setConfig((prev) => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen,
    }));
  };

  const closeMobileMenu = () => {
    setConfig((prev) => ({
      ...prev,
      mobileMenuOpen: false,
    }));
  };

  const toggleSidebar = () => {
    setConfig((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  };

  return {
    ...config,
    isMobile,
    isTablet,
    isDesktop,
    toggleMobileMenu,
    closeMobileMenu,
    toggleSidebar,
  };
}
