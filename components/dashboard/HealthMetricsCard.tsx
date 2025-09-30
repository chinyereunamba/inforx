"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Pill,
  Heart,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  description?: string;
}

interface HealthScoreProps {
  score: number;
  breakdown: Record<string, number>;
  className?: string;
}

interface TrendIndicatorProps {
  value: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  description,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                color
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {change !== undefined && <TrendIndicator value={change} />}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendIndicator({ value, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isNeutral
          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          : isPositive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
        className
      )}
    >
      {isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {Math.abs(value)}%
    </div>
  );
}

export function HealthScoreCard({
  score,
  breakdown,
  className,
}: HealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={cn("text-4xl font-bold", getScoreColor(score))}>
            {score}
          </div>
          <p className="text-sm text-muted-foreground">out of 100</p>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={cn(
              "h-3 rounded-full transition-all duration-1000",
              getProgressColor(score)
            )}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Score Breakdown</h4>
          {Object.entries(breakdown).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
              <Badge variant="secondary" className="text-xs">
                {value} pts
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickMetricsGrid({
  totalRecords,
  activeMedications,
  unreadNotifications,
  recentRecords,
  trends,
}: {
  totalRecords: number;
  activeMedications: number;
  unreadNotifications: number;
  recentRecords: number;
  trends: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Records"
        value={totalRecords}
        change={trends.records}
        icon={FileText}
        color="bg-blue-500"
        description="Medical documents"
      />

      <MetricCard
        title="Active Medications"
        value={activeMedications}
        change={trends.medications}
        icon={Pill}
        color="bg-emerald-500"
        description="Currently tracking"
      />

      <MetricCard
        title="Notifications"
        value={unreadNotifications}
        change={trends.notifications}
        icon={Bell}
        color="bg-orange-500"
        description="Unread alerts"
      />

      <MetricCard
        title="Recent Activity"
        value={recentRecords}
        icon={TrendingUp}
        color="bg-purple-500"
        description="Last 30 days"
      />
    </div>
  );
}
