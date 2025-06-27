"use client";

import ModernDashboardOverview from "@/components/dashboard/ModernDashboardOverview";
import InteractiveChart from "@/components/dashboard/InteractiveChart";

// Sample data for charts
const healthScoreData = [
  { date: "Mon", value: 78, label: "Health Score" },
  { date: "Tue", value: 82, label: "Health Score" },
  { date: "Wed", value: 85, label: "Health Score" },
  { date: "Thu", value: 83, label: "Health Score" },
  { date: "Fri", value: 88, label: "Health Score" },
  { date: "Sat", value: 90, label: "Health Score" },
  { date: "Sun", value: 87, label: "Health Score" }
];

const activityData = [
  { date: "Week 1", value: 12, label: "Activities" },
  { date: "Week 2", value: 18, label: "Activities" },
  { date: "Week 3", value: 15, label: "Activities" },
  { date: "Week 4", value: 22, label: "Activities" },
  { date: "Week 5", value: 28, label: "Activities" },
  { date: "Week 6", value: 25, label: "Activities" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Main Dashboard Overview */}
      <ModernDashboardOverview />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Health Score Trend"
          data={healthScoreData}
          color="emerald"
          type="line"
        />
        <InteractiveChart
          title="Weekly Activities"
          data={activityData}
          color="sky"
          type="bar"
        />
      </div>
    </div>
  );
}