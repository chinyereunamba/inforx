"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signOut } from "@/app/(auth)/auth/auth";
import { LoggingService } from "@/lib/services/logging-service";
import {
  User,
  Palette,
  Bell,
  Lock,
  LogOut,
  Sun,
  Moon,
  CheckCircle,
  Shield,
  Smartphone,
  Laptop,
  Calendar,
  Mail,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Sidebar items
const sidebarItems = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "theme", icon: Palette, label: "Theme" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "security", icon: Lock, label: "Security" },
  { id: "logout", icon: LogOut, label: "Logout", danger: true },
];

export default function SettingsPanel() {
  const [activeSection, setActiveSection] = useState("theme");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deviceType, setDeviceType] = useState("");

  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Detect device type
  useEffect(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType("Mobile");
    } else {
      setDeviceType("Desktop");
    }
  }, []);

  // Animation effects
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        ".settings-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [activeSection]);

  // Handle theme change
  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");

    // Log theme change
    if (user) {
      LoggingService.logAction(user, "change_theme", {
        theme: isDark ? "dark" : "light",
        device: deviceType,
      });
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Log settings saved
    if (user) {
      LoggingService.logAction(user, "save_settings", {
        section: activeSection,
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (user) {
      await LoggingService.logAction(user, LoggingService.actions.LOGOUT, {
        device: deviceType,
      });
    }
    await signOut();
  };

  // Handle sidebar click
  const handleSidebarClick = (sectionId: string) => {
    if (sectionId === "logout") {
      handleLogout();
      return;
    }

    setActiveSection(sectionId);

    // Log section change
    if (user) {
      LoggingService.logAction(user, "view_settings_section", {
        section: sectionId,
      });
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={containerRef} className="container mx-auto py-6">
      <h1 className="text-3xl font-bold font-noto mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeSection === item.id
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <item.icon
                className={`h-5 w-5 ${
                  item.danger
                    ? "text-red-500"
                    : activeSection === item.id
                    ? "text-sky-600"
                    : "text-slate-500"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Theme Settings */}
          {activeSection === "theme" && (
            <Card className="settings-card border border-slate-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Palette className="h-6 w-6 text-sky-600" />
                      Theme Settings
                    </CardTitle>
                    <CardDescription>
                      Customize how InfoRx looks for you
                    </CardDescription>
                  </div>
                  {saveSuccess && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">
                      Theme Mode
                    </h3>
                    <p className="text-sm text-slate-600">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={handleThemeChange}
                    />
                    <Moon className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-md">
                    <div className="text-center">
                      <Sun className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-slate-900 mb-1">
                        Light Mode
                      </h3>
                      <p className="text-sm text-slate-600">
                        Clear, bright interface, ideal for daytime use
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-md">
                    <div className="text-center">
                      <Moon className="h-6 w-6 text-sky-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-white mb-1">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-slate-300">
                        Reduced eye strain, perfect for night time
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile Info */}
          <Card className="settings-card border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-sky-600" />
                Basic Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and session information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="font-medium">
                      {user?.email || "Not available"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      Last Sign In
                    </div>
                    <div className="font-medium">
                      {formatDate(user?.last_sign_in_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  {deviceType === "Mobile" ? (
                    <Smartphone className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Laptop className="h-5 w-5 text-slate-500" />
                  )}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      Device Type
                    </div>
                    <div className="font-medium">{deviceType}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Info className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="text-xs text-slate-500 mb-1">
                      Account Type
                    </div>
                    <div className="font-medium">
                      {user?.user_metadata?.role || "Standard User"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 text-center text-sm text-slate-600">
            <div className="flex justify-center items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Your data is encrypted and secure with InfoRx.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
