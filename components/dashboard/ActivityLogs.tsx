"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  FileText, 
  User, 
  Brain, 
  LogIn, 
  LogOut, 
  Upload, 
  Trash, 
  BarChart2, 
  Loader2, 
  Eye, 
  Pencil,
  Clock,
  Calendar as CalendarIcon,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ActionConfig {
  icon: React.ComponentType<any>;
  color: string;
  label: string;
  badgeColor: string;
  description: string;
}

export default function ActivityLogs() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupedLogs, setGroupedLogs] = useState<Record<string, Log[]>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{from: string | null, to: string | null}>({
    from: null,
    to: null
  });

  const actionConfigs: Record<string, ActionConfig> = {
    user_login: {
      icon: LogIn,
      color: "text-green-500",
      label: "User Login",
      badgeColor: "bg-green-100 text-green-800 border-green-200",
      description: "Successfully signed into account"
    },
    user_logout: {
      icon: LogOut,
      color: "text-slate-500",
      label: "User Logout",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      description: "Signed out of account"
    },
    user_signup: {
      icon: User,
      color: "text-blue-500",
      label: "User Signup",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Created a new account"
    },
    uploaded_file: {
      icon: Upload,
      color: "text-blue-500",
      label: "File Upload",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Uploaded a new medical record"
    },
    deleted_file: {
      icon: Trash,
      color: "text-red-500",
      label: "File Delete",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      description: "Deleted a medical record"
    },
    generated_summary: {
      icon: BarChart2,
      color: "text-purple-500",
      label: "Summary Generation",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      description: "Generated a health summary"
    },
    viewed_summary: {
      icon: Eye,
      color: "text-indigo-500",
      label: "Viewed Summary",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      description: "Viewed a health summary"
    },
    used_ai_interpreter: {
      icon: Brain,
      color: "text-emerald-500",
      label: "AI Interpreter",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Used AI to interpret medical text"
    },
    viewed_record: {
      icon: FileText,
      color: "text-amber-500",
      label: "Viewed Record",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Viewed a medical record"
    },
    updated_record: {
      icon: Pencil,
      color: "text-sky-500",
      label: "Updated Record",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      description: "Updated a medical record"
    },
    page_view: {
      icon: Eye,
      color: "text-gray-500",
      label: "Page View",
      badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
      description: "Visited a page on the platform"
    }
  };

  const fetchLogs = async (page = 1, action = "", from = null, to = null) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pagination.limit.toString());

      if (action) {
        params.append("action", action);
      }
      
      if (from) {
        params.append("from", from);
      }
      
      if (to) {
        params.append("to", to);
      }

      const response = await fetch(`/api/logs?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
      
      // Group logs by date
      groupLogsByDate(data.logs);
      
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch activity logs"
      );
    } finally {
      setLoading(false);
    }
  };

  const groupLogsByDate = (logs: Log[]) => {
    const grouped: Record<string, Log[]> = {};
    
    logs.forEach(log => {
      const date = new Date(log.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(log);
    });
    
    setGroupedLogs(grouped);
  };

  useEffect(() => {
    if (user) {
      fetchLogs(pagination.page, actionFilter, dateRange.from ?? undefined, dateRange.to ?? undefined);
    }
  }, [user, pagination.page, actionFilter, dateRange.from, dateRange.to]);

  const getActionInfo = (action: string): ActionConfig => {
    return (
      actionConfigs[action] || {
        icon: Activity,
        color: "text-slate-500",
        label: formatActionName(action),
        badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        description: "Performed an action"
      }
    );
  };

  const formatActionName = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const formatMetadata = (metadata: Record<string, any>) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    return Object.entries(metadata).map(([key, value]) => {
      const formattedKey = key.replace(/_/g, " ");
      
      // Handle different value types
      let displayValue = value;
      
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      }
      
      return (
        <div key={key} className="grid grid-cols-3 gap-2 text-sm mb-1">
          <div className="font-medium text-slate-700 capitalize">{formattedKey}:</div>
          <div className="col-span-2 text-slate-600 break-words">{displayValue}</div>
        </div>
      );
    });
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleDateFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const today = new Date();
    const now = new Date().toISOString();
    
    let from = null;
    
    if (value === 'today') {
      from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    } else if (value === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      from = yesterday.toISOString();
      
      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);
    } else if (value === 'week') {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      from = lastWeek.toISOString();
    } else if (value === 'month') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      from = lastMonth.toISOString();
    }
    
    setDateRange({ from, to: now });
  };

  const actionOptions = [
    { value: "", label: "All Activities" },
    { value: "user_login", label: "User Login" },
    { value: "user_logout", label: "User Logout" },
    { value: "uploaded_file", label: "File Upload" },
    { value: "deleted_file", label: "File Delete" },
    { value: "generated_summary", label: "Summary Generation" },
    { value: "used_ai_interpreter", label: "AI Interpreter" },
    { value: "page_view", label: "Page Views" },
  ];

  return (
    <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Activity className="h-6 w-6 text-blue-600" />
              Activity Timeline
            </CardTitle>
            <CardDescription className="text-base">
              Track your recent actions and interactions with the platform
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.page, actionFilter, dateRange.from, dateRange.to)}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-slate-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-semibold">{pagination.total || 0}</div>
              <div className="text-sm text-slate-500">Total Activities</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-3 mb-3">
                <LogIn className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-semibold">
                {logs.filter(log => log.action === 'user_login').length}
              </div>
              <div className="text-sm text-slate-500">Logins</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-3 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-semibold">
                {logs.filter(log => log.action === 'used_ai_interpreter').length}
              </div>
              <div className="text-sm text-slate-500">AI Usages</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-amber-100 rounded-full p-3 mb-3">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-semibold">
                {Object.keys(groupedLogs).length}
              </div>
              <div className="text-sm text-slate-500">Active Days</div>
            </CardContent>
          </Card>
        </div>
      
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center relative min-w-[180px]">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              onChange={handleDateFilter}
              className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              defaultValue=""
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading activity logs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-2">
              No activity logs found
            </p>
            <p className="text-slate-500 max-w-md mx-auto">
              {actionFilter
                ? `No logs found for the selected filter. Try selecting a different filter.`
                : `Your activity logs will appear here as you use the platform.`}
            </p>
          </div>
        )}

        {/* Logs Timeline */}
        {!loading && logs.length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="flex items-center mb-4">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <div className="mx-4 flex items-center">
                    <CalendarIcon className="h-4 w-4 text-slate-500 mr-2" />
                    <span className="text-slate-700 font-medium">{date}</span>
                    <Badge variant="outline" className="ml-2 bg-slate-100">
                      {dateLogs.length}
                    </Badge>
                  </div>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                
                {/* Timeline Line */}
                <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-slate-200 z-0"></div>
                
                {/* Timeline Items */}
                <div className="space-y-4 relative">
                  {dateLogs.map((log) => {
                    const {
                      icon: IconComponent,
                      color,
                      label,
                      badgeColor,
                      description
                    } = getActionInfo(log.action);
                    
                    return (
                      <div 
                        key={log.id} 
                        className={cn(
                          "relative flex pl-10 z-10",
                          expandedCard === log.id ? "pb-4" : ""
                        )}
                      >
                        {/* Timeline Point */}
                        <div className="absolute left-[11px] -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-white border-2 border-blue-600 z-20"></div>
                        
                        {/* Card */}
                        <div className="flex-1">
                          <Card className="border border-slate-200 hover:border-slate-300 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} bg-opacity-10`}>
                                    <IconComponent className="h-4 w-4" />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={badgeColor}>{label}</Badge>
                                      <span className="text-xs text-slate-500">
                                        {formatDate(log.created_at)}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700">
                                      {description}
                                      {log.action === 'page_view' && log.metadata?.page && (
                                        <span className="font-medium">
                                          : {log.metadata.page.replace(/_/g, ' ')}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandCard(log.id)}
                                  className="h-7 w-7 p-0 rounded-full"
                                >
                                  {expandedCard === log.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              
                              {/* Expanded Details */}
                              {expandedCard === log.id && log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <div className="bg-slate-50 rounded-md p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Info className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-slate-700">Details</span>
                                    </div>
                                    {formatMetadata(log.metadata)}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1 || loading}
                onClick={() => fetchLogs(pagination.page - 1, actionFilter)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages || loading}
                onClick={() => fetchLogs(pagination.page + 1, actionFilter)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}