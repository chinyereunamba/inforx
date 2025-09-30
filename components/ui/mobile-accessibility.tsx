"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TouchButton } from "./touch-button";
import {
  Volume2,
  VolumeX,
  Type,
  Contrast,
  Eye,
  EyeOff,
  Accessibility,
  X,
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large" | "extra-large";
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceAnnouncements: boolean;
}

export default function MobileAccessibility() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    voiceAnnouncements: false,
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)");

    if (prefersReducedMotion.matches) {
      setSettings((prev) => ({ ...prev, reduceMotion: true }));
    }

    if (prefersHighContrast.matches) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
      "extra-large": "20px",
    };
    root.style.setProperty("--base-font-size", fontSizeMap[settings.fontSize]);

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Reduced motion
    if (settings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Save settings
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const announceChange = (message: string) => {
    if (settings.voiceAnnouncements && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0.5;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Accessibility Button */}
      <TouchButton
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-50 lg:bottom-4",
          "w-12 h-12 rounded-full shadow-lg",
          "bg-teal-600 hover:bg-teal-700 text-white",
          "focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        )}
        aria-label="Open accessibility settings"
        touchSize="spacious"
      >
        <Accessibility className="w-6 h-6" />
      </TouchButton>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 lg:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={cn(
              "relative w-full max-w-md bg-white dark:bg-slate-800",
              "rounded-t-2xl lg:rounded-2xl shadow-xl",
              "max-h-[80vh] overflow-y-auto"
            )}
            role="dialog"
            aria-labelledby="accessibility-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2
                id="accessibility-title"
                className="text-lg font-semibold text-slate-900 dark:text-white"
              >
                Accessibility Settings
              </h2>
              <TouchButton
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                aria-label="Close accessibility settings"
              >
                <X className="w-5 h-5" />
              </TouchButton>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Text Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["small", "medium", "large", "extra-large"] as const).map(
                    (size) => (
                      <TouchButton
                        key={size}
                        onClick={() => {
                          updateSetting("fontSize", size);
                          announceChange(`Text size changed to ${size}`);
                        }}
                        variant={
                          settings.fontSize === size ? "default" : "outline"
                        }
                        size="sm"
                        className="justify-center"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        {size.charAt(0).toUpperCase() +
                          size.slice(1).replace("-", " ")}
                      </TouchButton>
                    )
                  )}
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    High Contrast
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <TouchButton
                  onClick={() => {
                    const newValue = !settings.highContrast;
                    updateSetting("highContrast", newValue);
                    announceChange(
                      `High contrast ${newValue ? "enabled" : "disabled"}`
                    );
                  }}
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Contrast className="w-4 h-4" />
                </TouchButton>
              </div>

              {/* Reduce Motion */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Reduce Motion
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Minimize animations and transitions
                  </p>
                </div>
                <TouchButton
                  onClick={() => {
                    const newValue = !settings.reduceMotion;
                    updateSetting("reduceMotion", newValue);
                    announceChange(
                      `Motion reduction ${newValue ? "enabled" : "disabled"}`
                    );
                  }}
                  variant={settings.reduceMotion ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {settings.reduceMotion ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </TouchButton>
              </div>

              {/* Voice Announcements */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Voice Announcements
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Hear audio feedback for actions
                  </p>
                </div>
                <TouchButton
                  onClick={() => {
                    const newValue = !settings.voiceAnnouncements;
                    updateSetting("voiceAnnouncements", newValue);
                    if (newValue) {
                      announceChange("Voice announcements enabled");
                    }
                  }}
                  variant={settings.voiceAnnouncements ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {settings.voiceAnnouncements ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </TouchButton>
              </div>

              {/* Reset Button */}
              <TouchButton
                onClick={() => {
                  const defaultSettings: AccessibilitySettings = {
                    fontSize: "medium",
                    highContrast: false,
                    reduceMotion: false,
                    screenReader: false,
                    voiceAnnouncements: false,
                  };
                  setSettings(defaultSettings);
                  announceChange("Accessibility settings reset to default");
                }}
                variant="outline"
                className="w-full"
              >
                Reset to Default
              </TouchButton>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="accessibility-announcements"
      />
    </>
  );
}
