"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Activity,
  FileText,
  Calendar,
  Users,
  Palette,
  Type,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

export default function DashboardStyleGuide() {
  const [activeTab, setActiveTab] = useState("colors");

  const tabs = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "components", label: "Components", icon: Layout },
    { id: "responsive", label: "Responsive", icon: Smartphone },
  ];

  const colorPalette = {
    primary: {
      name: "Primary Blue",
      colors: [
        { name: "sky-50", value: "#f0f9ff", hex: "#f0f9ff" },
        { name: "sky-100", value: "#e0f2fe", hex: "#e0f2fe" },
        { name: "sky-500", value: "#0ea5e9", hex: "#0ea5e9" },
        { name: "sky-600", value: "#0284c7", hex: "#0284c7" },
        { name: "sky-900", value: "#0c4a6e", hex: "#0c4a6e" },
      ],
    },
    secondary: {
      name: "Emerald Green",
      colors: [
        { name: "emerald-50", value: "#ecfdf5", hex: "#ecfdf5" },
        { name: "emerald-100", value: "#d1fae5", hex: "#d1fae5" },
        { name: "emerald-500", value: "#10b981", hex: "#10b981" },
        { name: "emerald-600", value: "#059669", hex: "#059669" },
        { name: "emerald-900", value: "#064e3b", hex: "#064e3b" },
      ],
    },
    neutral: {
      name: "Slate Gray",
      colors: [
        { name: "slate-50", value: "#f8fafc", hex: "#f8fafc" },
        { name: "slate-100", value: "#f1f5f9", hex: "#f1f5f9" },
        { name: "slate-500", value: "#64748b", hex: "#64748b" },
        { name: "slate-800", value: "#1e293b", hex: "#1e293b" },
        { name: "slate-900", value: "#0f172a", hex: "#0f172a" },
      ],
    },
  };

  const typography = {
    headings: [
      {
        size: "text-4xl",
        weight: "font-bold",
        example: "Main Dashboard Title",
      },
      { size: "text-2xl", weight: "font-semibold", example: "Section Heading" },
      { size: "text-lg", weight: "font-medium", example: "Card Title" },
      { size: "text-base", weight: "font-normal", example: "Body Text" },
      { size: "text-sm", weight: "font-normal", example: "Small Text" },
      { size: "text-xs", weight: "font-normal", example: "Caption Text" },
    ],
  };

  const renderColors = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          InfoRx Healthcare Color Palette
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Our color system is designed to convey trust, health, and
          professionalism while maintaining excellent accessibility standards.
        </p>
      </div>

      {Object.entries(colorPalette).map(([key, palette]) => (
        <div key={key} className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">
            {palette.name}
          </h4>
          <div className="max-w-7xl grid grid-cols-5 gap-3">
            {palette.colors.map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className="w-full h-16 rounded-lg border border-slate-200 dark:border-slate-700 mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-slate-900 dark:text-white">
                  {color.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {color.hex}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h4 className="font-medium text-slate-900 dark:text-white mb-3">
          Usage Guidelines
        </h4>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• Sky-500 for primary actions and key interface elements</li>
          <li>
            • Emerald-500 for success states and positive health indicators
          </li>
          <li>• Slate colors for text hierarchy and neutral backgrounds</li>
          <li>• Maintain 4.5:1 contrast ratio for accessibility compliance</li>
        </ul>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Typography System</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Clean, readable typography using Inter font family for optimal
          readability across all devices.
        </p>
      </div>

      <div className="space-y-6">
        {typography.headings.map((heading, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <div
              className={`${heading.size} ${heading.weight} text-slate-900 dark:text-white`}
            >
              {heading.example}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {heading.size}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {heading.weight}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h4 className="font-medium text-slate-900 dark:text-white mb-3">
          Typography Rules
        </h4>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• Noto Sans font family for heading elements</li>
          <li>• Inter font family for all text elements</li>
          <li>• 150% line height for body text, 120% for headings</li>
          <li>• Maximum 3 font weights per design</li>
          <li>• Consistent hierarchy with clear visual distinction</li>
        </ul>
      </div>
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Component Library</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Reusable components built with consistency and accessibility in mind.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">
            Buttons
          </h4>
          <div className="flex flex-wrap gap-3">
            <Button>Primary Button</Button>
            <Button variant="outline">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button size="sm">Small Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">Cards</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Health Metric
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  85%
                </p>
                <p className="text-sm text-slate-500">Overall Health Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-sky-500" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-slate-500">Daily goal progress</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">Badges</h4>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </div>

        {/* Icons */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">
            Medical Icons
          </h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-sm">Heart Health</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-sky-500" />
              <span className="text-sm">Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-500" />
              <span className="text-sm">Records</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-orange-500" />
              <span className="text-sm">Patients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResponsive = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Responsive Design</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Mobile-first approach ensuring optimal experience across all devices.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900 dark:text-white">
            Breakpoints
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-slate-500" />
                <span className="font-medium">Mobile</span>
              </div>
              <span className="text-sm text-slate-500">640px</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Tablet className="h-5 w-5 text-slate-500" />
                <span className="font-medium">Tablet</span>
              </div>
              <span className="text-sm text-slate-500">640px - 1024px</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-slate-500" />
                <span className="font-medium">Desktop</span>
              </div>
              <span className="text-sm text-slate-500">1024px</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            Design Principles
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Touch targets minimum 44px for mobile usability</li>
            <li>• Collapsible navigation for smaller screens</li>
            <li>• Responsive grid system with auto-layout</li>
            <li>• Optimized content hierarchy for mobile reading</li>
            <li>• Gesture-friendly interactions and swipe support</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-noto text-slate-900 dark:text-white mb-2">
          InfoRx Design System
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          A comprehensive style guide for the InfoRx healthcare platform,
          ensuring consistent and accessible design across all components.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        {activeTab === "colors" && renderColors()}
        {activeTab === "typography" && renderTypography()}
        {activeTab === "components" && renderComponents()}
        {activeTab === "responsive" && renderResponsive()}
      </div>
    </div>
  );
}
