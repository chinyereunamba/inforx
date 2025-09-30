"use client";

import { useState, useEffect } from "react";
import {
  useScreenSize,
  mobileAnimations,
  gestureClasses,
} from "@/lib/utils/responsive";
import { useSwipeGesture } from "@/lib/utils/gestures";
import { cn } from "@/lib/utils";
import { TouchButton } from "@/components/ui/touch-button";
import ResponsiveGrid from "@/components/ui/responsive-grid";
import ResponsiveCard from "@/components/ui/responsive-card";
import {
  Heart,
  FileText,
  Brain,
  Activity,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Plus,
} from "lucide-react";

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: any;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

const dashboardMetrics: DashboardMetric[] = [
  {
    id: "records",
    title: "Medical Records",
    value: 12,
    change: "+2 this week",
    trend: "up",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    id: "health-score",
    title: "Health Score",
    value: "85%",
    change: "+5% this month",
    trend: "up",
    icon: Heart,
    color: "bg-red-500",
  },
  {
    id: "ai-insights",
    title: "AI Insights",
    value: 8,
    change: "3 new",
    trend: "up",
    icon: Brain,
    color: "bg-purple-500",
  },
  {
    id: "activity",
    title: "Activity Score",
    value: "92%",
    change: "Excellent",
    trend: "up",
    icon: Activity,
    color: "bg-green-500",
  },
];

const quickActions: QuickAction[] = [
  {
    id: "upload",
    title: "Upload Document",
    description: "Add new medical records",
    icon: Plus,
    href: "/dashboard/medical-vault",
    color: "bg-teal-500",
  },
  {
    id: "interpret",
    title: "AI Interpreter",
    description: "Analyze medical documents",
    icon: Brain,
    href: "/dashboard/interpreter",
    color: "bg-purple-500",
  },
  {
    id: "schedule",
    title: "Schedule Reminder",
    description: "Set medication alerts",
    icon: Calendar,
    href: "/dashboard/settings",
    color: "bg-blue-500",
  },
];

export default function MobileDashboardOptimized() {
  const { isMobile, isTablet } = useScreenSize();
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const swipeGesture = useSwipeGesture((direction) => {
    if (
      direction.direction === "left" &&
      currentMetricIndex < dashboardMetrics.length - 1
    ) {
      setCurrentMetricIndex((prev) => prev + 1);
    } else if (direction.direction === "right" && currentMetricIndex > 0) {
      setCurrentMetricIndex((prev) => prev - 1);
    }
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={cn("space-y-2", mobileAnimations.slideUp)}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's your health overview for today
        </p>
      </div>

      {/* Metrics Cards - Swipeable on Mobile */}
      {isMobile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Health Metrics
            </h2>
            <div className="flex space-x-1">
              {dashboardMetrics.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-200",
                    index === currentMetricIndex
                      ? "bg-teal-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  )}
                />
              ))}
            </div>
          </div>

          <div
            className={cn("overflow-hidden", gestureClasses.swipeable)}
            {...swipeGesture}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentMetricIndex * 100}%)`,
              }}
            >
              {dashboardMetrics.map((metric) => (
                <div key={metric.id} className="w-full flex-shrink-0 px-1">
                  <MetricCard metric={metric} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Health Metrics
          </h2>
          <ResponsiveGrid
            variant="dashboard"
            gap="md"
            enableGestures
            animateChildren
          >
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </ResponsiveGrid>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Quick Actions
        </h2>
        <ResponsiveGrid
          variant={isMobile ? "form" : "cards"}
          gap="sm"
          enableGestures
        >
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </ResponsiveGrid>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <TouchButton
            variant="ghost"
            size="sm"
            className="text-teal-600 dark:text-teal-400"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </TouchButton>
        </div>

        <ResponsiveCard
          className="space-y-3"
          interactive
          enableGestures
          animateOnHover
        >
          {[
            "Uploaded lab results from City Hospital",
            "AI analysis completed for prescription",
            "Medication reminder set for 2:00 PM",
          ].map((activity, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg",
                "bg-slate-50 dark:bg-slate-800/50",
                mobileAnimations.fadeIn
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                {activity}
              </p>
            </div>
          ))}
        </ResponsiveCard>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const IconComponent = metric.icon;

  return (
    <ResponsiveCard
      className={cn("relative overflow-hidden", mobileAnimations.fadeIn)}
      interactive
      enableGestures
      animateOnHover
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {metric.title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {metric.value}
          </p>
          {metric.change && (
            <p
              className={cn(
                "text-xs font-medium",
                metric.trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : metric.trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {metric.change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            metric.color
          )}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>
    </ResponsiveCard>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const IconComponent = action.icon;

  return (
    <ResponsiveCard
      className={cn("group cursor-pointer", mobileAnimations.fadeIn)}
      interactive
      enableGestures
      animateOnHover
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            action.color
          )}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {action.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {action.description}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
      </div>
    </ResponsiveCard>
  );
}
