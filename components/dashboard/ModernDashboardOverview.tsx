"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Activity,
  Heart,
  Calendar,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  Share,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  delay?: number;
}

interface ActivityItem {
  id: string;
  type: "upload" | "analysis" | "appointment" | "alert";
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "info";
}

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  delay = 0,
}: MetricCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isPositive = change > 0;

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: delay * 0.1,
      }
    );
  }, [delay]);

  return (
    <Card
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
            }`}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HealthProgress = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      progressRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.4 }
    );
  }, []);

  const healthMetrics = [
    { label: "Blood Pressure Monitoring", value: 85, color: "bg-sky-500" },
    { label: "Medication Adherence", value: 92, color: "bg-emerald-500" },
    { label: "Symptom Tracking", value: 78, color: "bg-purple-500" },
    { label: "Exercise Goals", value: 65, color: "bg-orange-500" },
  ];

  return (
    <Card className="col-span-full lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {metric.label}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {metric.value}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                {...metric}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const RecentActivity = () => {
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      activityRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.6 }
    );
  }, []);

  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "upload",
      title: "Lab Results Uploaded",
      description: "Blood test results from Lagos State Hospital",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: "2",
      type: "analysis",
      title: "AI Analysis Complete",
      description: "Prescription analysis for Metformin 500mg",
      time: "4 hours ago",
      status: "info",
    },
    {
      id: "3",
      type: "appointment",
      title: "Upcoming Appointment",
      description: "Dr. Adebayo - Cardiology consultation",
      time: "Tomorrow 2:00 PM",
      status: "warning",
    },
    {
      id: "4",
      type: "alert",
      title: "Medication Reminder",
      description: "Time to take your evening medication",
      time: "6 hours ago",
      status: "warning",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
      case "warning":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400";
      case "info":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "upload":
        return FileText;
      case "analysis":
        return Activity;
      case "appointment":
        return Calendar;
      case "alert":
        return Heart;
      default:
        return Activity;
    }
  };

  return (
    <Card ref={activityRef} className="col-span-full lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-500" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getTypeIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(
                    activity.status
                  )}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {activity.time}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      actionsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.8 }
    );
  }, []);

  const actions = [
    {
      label: "Upload Document",
      icon: FileText,
      href: "/dashboard/upload",
      color: "bg-sky-500",
    },
    {
      label: "AI Analysis",
      icon: Activity,
      href: "/dashboard/interpreter",
      color: "bg-emerald-500",
    },
    {
      label: "View Records",
      icon: Users,
      href: "/dashboard/records",
      color: "bg-purple-500",
    },
    {
      label: "Download Report",
      icon: Download,
      href: "#",
      color: "bg-orange-500",
    },
  ];

  return (
    <Card ref={actionsRef} className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 group"
              asChild
            >
              <a href={action.href}>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {action.label}
                </span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ModernDashboardOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );
  }, []);

  const metrics = [
    {
      title: "Total Records",
      value: "24",
      change: 12,
      icon: FileText,
      color: "bg-sky-500",
    },
    {
      title: "AI Analyses",
      value: "18",
      change: 8,
      icon: Activity,
      color: "bg-emerald-500",
    },
    {
      title: "Health Score",
      value: "86%",
      change: 4,
      icon: Heart,
      color: "bg-red-500",
    },
    {
      title: "Appointments",
      value: "3",
      change: -1,
      icon: Calendar,
      color: "bg-purple-500",
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold font-noto mb-2">Welcome back! 👋</h1>
        <p className="text-sky-100">
          You have 2 new health insights and 1 upcoming appointment.
          <span className="font-medium"> Your health journey is on track!</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HealthProgress />
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
