"use client";

import { useEffect } from "react";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

export default function SettingsPage() {
  const { user } = useAuthStore();

  // Log page view
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "settings",
      });
    }
  }, [user]);

  return <SettingsPanel />;
}
