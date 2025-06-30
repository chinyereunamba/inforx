"use client";

import { useEffect, useState } from "react";
import ActivityLogs from "@/components/dashboard/ActivityLogs";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, Clock, FileText } from "lucide-react";

export default function ActivityPage() {
  const { user } = useAuthStore();
  const [activityStats, setActivityStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });

  // Log page view
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "activity_logs",
      });

      // In a real app, we would fetch these statistics from an API
      // For this demo, we'll just set some placeholder values
      
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-noto text-gray-900 mb-2">
          Activity Timeline
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Track your activity history and interactions with InfoRx. This helps
          you monitor your healthcare journey and understand how you're using
          the platform over time.
        </p>
      </div>

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full p-3 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-semibold">{activityStats.today}</div>
            <div className="text-sm text-slate-500">Today's Activities</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-emerald-100 rounded-full p-3 mb-3">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-semibold">
              {activityStats.thisWeek}
            </div>
            <div className="text-sm text-slate-500">This Week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-purple-100 rounded-full p-3 mb-3">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-semibold">
              {activityStats.thisMonth}
            </div>
            <div className="text-sm text-slate-500">This Month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-amber-100 rounded-full p-3 mb-3">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-2xl font-semibold">{activityStats.total}</div>
            <div className="text-sm text-slate-500">Total Activities</div>
          </CardContent>
        </Card>
      </div> */}

      <ActivityLogs />
    </div>
  );
}
