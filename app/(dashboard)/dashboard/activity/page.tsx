"use client";

import { useEffect } from "react";
import ActivityLogs from "@/components/dashboard/ActivityLogs";
import { useAuthStore } from "@/lib/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

export default function ActivityPage() {
  const { user } = useAuthStore();
  
  // Log page view
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "activity_logs"
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-2xl font-bold font-noto text-gray-900 mb-2">Activity Logs</h1>
        <p className="text-gray-600">
          Track your recent activity and interactions with InfoRx. This helps you monitor your healthcare journey and security.
        </p>
      </div> */}
      
      <ActivityLogs />
    </div>
  );
}