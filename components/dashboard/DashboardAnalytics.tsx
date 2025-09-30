"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import { QuickMetricsGrid, HealthScoreCard } from "./HealthMetricsCard";
import { HealthTrendsChart } from "./HealthTrendsChart";
import { useAuthStore } from "@/lib/stores/auth-store";

interface HealthMetrics {
  totalRecords: number;
  activeMedications: number;
  totalNotifications: number;
  unreadNotifications: number;
  recentRecords: number;
  healthScore: number;
  healthScoreFactors: {
    recordsUploaded: number;
    medicationCompliance: number;
    recentActivity: number;
    dataCompleteness: number;
  };
  trends: {
    records: number;
    medications: number;
    healthScore: number;
    notifications: number;
  };
  recordsByType: Record<string, number>;
  monthlyData: Array<{
    month: string;
    records: number;
    medications: number;
  }>;
}

interface HealthInsight {
  id: string;
  type: "tip" | "warning" | "achievement";
  title: string;
  description: string;
  action?: string;
}

export function DashboardAnalytics() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      setError(null);
      const response = await fetch("/api/dashboard/metrics");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const data = await response.json();
      setMetrics(data);
      generateInsights(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateInsights = (data: HealthMetrics) => {
    const newInsights: HealthInsight[] = [];

    // Record upload insights
    if (data.recentRecords === 0) {
      newInsights.push({
        id: "no-recent-records",
        type: "tip",
        title: "Upload Recent Records",
        description:
          "Keep your health profile current by uploading recent medical documents.",
        action: "Upload Now",
      });
    } else if (data.recentRecords > 5) {
      newInsights.push({
        id: "active-uploader",
        type: "achievement",
        title: "Great Activity!",
        description: `You've uploaded ${data.recentRecords} records this month. Excellent health management!`,
      });
    }

    // Medication tracking insights
    if (data.activeMedications === 0) {
      newInsights.push({
        id: "no-medications",
        type: "tip",
        title: "Track Your Medications",
        description:
          "Add your current medications to enable reminders and interaction checking.",
        action: "Add Medications",
      });
    } else if (data.activeMedications > 3) {
      newInsights.push({
        id: "many-medications",
        type: "warning",
        title: "Multiple Medications",
        description:
          "You're tracking several medications. Consider setting up reminders for better adherence.",
        action: "Set Reminders",
      });
    }

    // Health score insights
    if (data.healthScore < 50) {
      newInsights.push({
        id: "low-health-score",
        type: "tip",
        title: "Improve Your Health Score",
        description:
          "Complete your profile and upload more records to boost your health score.",
        action: "Complete Profile",
      });
    } else if (data.healthScore > 80) {
      newInsights.push({
        id: "high-health-score",
        type: "achievement",
        title: "Excellent Health Score!",
        description: `Your health score of ${data.healthScore}% shows great health data management.`,
      });
    }

    // Trend insights
    if (data.trends.records > 20) {
      newInsights.push({
        id: "increasing-records",
        type: "achievement",
        title: "Trending Up!",
        description: `${data.trends.records}% increase in record uploads this month.`,
      });
    } else if (data.trends.records < -20) {
      newInsights.push({
        id: "decreasing-records",
        type: "warning",
        title: "Activity Decreased",
        description:
          "Your record uploads have decreased. Regular updates help maintain better health tracking.",
        action: "Upload Records",
      });
    }

    setInsights(newInsights);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  if (loading) {
    return <DashboardAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            className="ml-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health Analytics</h2>
          <p className="text-muted-foreground">
            Track your health data and get insights into your wellness journey
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Quick Metrics */}
      <QuickMetricsGrid
        totalRecords={metrics.totalRecords}
        activeMedications={metrics.activeMedications}
        unreadNotifications={metrics.unreadNotifications}
        recentRecords={metrics.recentRecords}
        trends={metrics.trends}
      />

      {/* Health Score and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <HealthScoreCard
          score={metrics.healthScore}
          breakdown={metrics.healthScoreFactors}
          className="lg:col-span-1"
        />

        <div className="lg:col-span-3">
          <HealthTrendsChart
            monthlyData={metrics.monthlyData}
            recordsByType={metrics.recordsByType}
          />
        </div>
      </div>

      {/* Health Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        insight.type === "achievement"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : insight.type === "warning"
                          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      }`}
                    >
                      {insight.type === "achievement" ? (
                        <Target className="h-4 w-4" />
                      ) : insight.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="mt-2">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
