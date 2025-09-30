"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
} from "lucide-react";
import { useState } from "react";

interface MonthlyData {
  month: string;
  records: number;
  medications: number;
}

interface RecordsByType {
  [key: string]: number;
}

interface HealthTrendsChartProps {
  monthlyData: MonthlyData[];
  recordsByType: RecordsByType;
  className?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const COLORS = {
  prescription: "#3B82F6",
  lab_result: "#10B981",
  scan: "#F59E0B",
  consultation: "#8B5CF6",
  other: "#6B7280",
};

const TYPE_LABELS = {
  prescription: "Prescriptions",
  lab_result: "Lab Results",
  scan: "Medical Scans",
  consultation: "Consultations",
  other: "Other Records",
};

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function HealthTrendsChart({
  monthlyData,
  recordsByType,
  className,
}: HealthTrendsChartProps) {
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");

  // Prepare pie chart data
  const pieData = Object.entries(recordsByType).map(([type, count]) => ({
    name: TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type,
    value: count,
    color: COLORS[type as keyof typeof COLORS] || COLORS.other,
  }));

  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="records"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Records"
            />
            <Area
              type="monotone"
              dataKey="medications"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Medications"
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="records" fill="#3B82F6" name="Records" />
            <Bar dataKey="medications" fill="#10B981" name="Medications" />
          </BarChart>
        );

      default:
        return (
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="records"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              name="Records"
            />
            <Line
              type="monotone"
              dataKey="medications"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              name="Medications"
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Health Activity Trends
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="h-8 px-2"
                >
                  <TrendingUp className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("area")}
                  className="h-8 px-2"
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="h-8 px-2"
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-muted-foreground">Medical Records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-muted-foreground">Medications</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            Records by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Records"]}
                  labelFormatter={(label: string) => label}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {pieData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {entry.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
