"use client";

import { useEffect } from "react";
import { MedicalSummary } from "@/components/medical-records/MedicalSummary";
import { useAuthStore } from "@/lib/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  // Log page view
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "dashboard_overview"
      });
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-6">
      <MedicalSummary />
    </div>
  );
}