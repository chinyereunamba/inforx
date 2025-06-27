"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          {/* Primary Footer Content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-center sm:text-left">
            <div className="text-sm text-gray-600 font-medium font-noto">
              InfoRx © 2025
            </div>
            <div className="text-sm text-gray-600">
              Not a substitute for professional medical advice
            </div>
            <div className="text-sm text-gray-600">
              Built for the Bolt.new Hackathon
            </div>
          </div>

          {/* Secondary Footer Links */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-center sm:text-left">
            <Link
              href="mailto:cunamba2@gmail.com"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200"
            >
              Contact
            </Link>
            <a
              href="https://github.com/chinyereunamba/inforx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200 inline-flex items-center gap-1"
            >
              GitHub Repository
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
