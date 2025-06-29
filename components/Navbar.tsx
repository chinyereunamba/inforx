"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

const navigationLinks: NavLink[] = [
  { href: "about", label: "About us" },
  { href: "demo", label: "Demo" },
  { href: "roadmap", label: "Roadmap" },
  { href: "faq", label: "FAQs" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathName = usePathname().split('/')[1];

  const handleNavigationClick = (route: string) => {
    // You can add analytics tracking or other functionality here
    // This function is called when a navigation link is clicked
  };

  // Track scroll position to show/hide shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    // Set initial scroll state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-navbar]")) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("click", handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white  transition-shadow duration-200 ${
          isScrolled ? "shadow-sm" : ""
        } w-full`}
        data-navbar
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-3 group"
                aria-label="InfoRx homepage"
              >
                <span
                  className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-200"
                  style={{ fontFamily: "Noto Sans, system-ui, sans-serif" }}
                >
                  InfoRx
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${link.href}`}
                    className={`${
                      pathName == link.href && "bg-teal-50 text-teal-600"
                    } text-slate-700 hover:text-teal-600 px-4 py-2 text-base font-medium transition-colors duration-200 rounded-md hover:bg-teal-50`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side - Contact Button and Language Selector */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Link href="/contact">Contact us</Link>
            </Button> */}

              {/* Language Selector */}
              <div className="flex items-center justify-start space-x-2 text-slate-700 hover:text-teal-600 cursor-pointer transition-colors duration-200">
                <Globe className="w-5 h-5" />
                <span className="font-medium">EN</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileMenu();
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-200"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle main menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden transition-all duration-300 ease-in-out z-50 ${
            isMobileMenuOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          } overflow-hidden bg-white border-t border-gray-100`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-teal-600 hover:bg-teal-50 block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
                onClick={() => {
                  closeMobileMenu();
                  handleNavigationClick(link.href);
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            {/* <Button
                asChild
                className="w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                <Link href="/contact" onClick={closeMobileMenu}>
                  Contact us
                </Link>
              </Button> */}

            {/* Mobile Language Selector */}
            <div className="flex items-center justify-center space-x-2 text-slate-700 py-2">
              <Globe className="w-5 h-5" />
              <span className="font-medium">EN</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        >
          <span className="sr-only">Close menu</span>
        </div>
      )}
    </>
  );
}
