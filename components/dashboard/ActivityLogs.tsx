"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Calendar,
  BarChart2,
  Loader2,
  Eye,
  LucideIcon,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth-store";

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
  icon: LucideIcon;
  color: string;
  label: string;
  badgeColor: string;
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

  const actionConfigs: Record<string, ActionConfig> = {
    user_login: {
      icon: LogIn,
      color: "text-green-500",
      label: "User Login",
      badgeColor: "bg-green-100 text-green-800"
    },
    user_logout: {
      icon: LogOut,
      color: "text-slate-500",
      label: "User Logout", 
      badgeColor: "bg-slate-100 text-slate-800"
    },
    user_signup: {
      icon: User,
      color: "text-blue-500",
      label: "User Signup",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    uploaded_file: {
      icon: Upload,
      color: "text-blue-500",
      label: "File Upload",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    deleted_file: {
      icon: Trash,
      color: "text-red-500",
      label: "File Delete",
      badgeColor: "bg-red-100 text-red-800"
    },
    generated_summary: {
      icon: BarChart2,
      color: "text-purple-500",
      label: "Summary Generation",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    viewed_summary: {
      icon: Eye,
      color: "text-indigo-500", 
      label: "Viewed Summary",
      badgeColor: "bg-indigo-100 text-indigo-800"
    },
    used_ai_interpreter: {
      icon: Brain,
      color: "text-emerald-500",
      label: "AI Interpreter",
      badgeColor: "bg-emerald-100 text-emerald-800"
    },
    viewed_record: {
      icon: FileText,
      color: "text-amber-500",
      label: "Viewed Record",
      badgeColor: "bg-amber-100 text-amber-800" 
    },
    updated_record: {
      icon: Pencil, 
      color: "text-sky-500",
      label: "Updated Record",
      badgeColor: "bg-sky-100 text-sky-800"
    },
    updated_profile: {
      icon: User,
      color: "text-violet-500",
      label: "Profile Update",
      badgeColor: "bg-violet-100 text-violet-800"
    }
  };

  const fetchLogs = async (page = 1, action = "") => {
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

      const response = await fetch(`/api/logs?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch logs");
      }
      
      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs(pagination.page, actionFilter);
    }
  }, [user, pagination.page, actionFilter]);

  const getActionInfo = (action: string): ActionConfig => {
    return actionConfigs[action] || {
      icon: Activity,
      color: "text-slate-500",
      label: formatActionName(action),
      badgeColor: "bg-slate-100 text-slate-800"
    };
  };

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const actionOptions = [
    { value: "", label: "All Activities" },
    { value: "user_login", label: "User Login" },
    { value: "user_logout", label: "User Logout" },
    { value: "uploaded_file", label: "File Upload" },
    { value: "deleted_file", label: "File Delete" },
    { value: "generated_summary", label: "Summary Generation" },
    { value: "used_ai_interpreter", label: "AI Interpreter" },
    { value: "viewed_record", label: "View Record" },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Activity Logs
            </CardTitle>
            <CardDescription>
              Track your recent actions and interactions with the platform
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.page, actionFilter)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
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
          
          <div className="flex items-center relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {actionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
            <p className="text-slate-700 font-medium mb-2">No activity logs found</p>
            <p className="text-slate-500 max-w-md mx-auto">
              {actionFilter ? 
                `No logs found for the selected action type. Try selecting a different filter.` : 
                `Your activity logs will appear here as you use the platform.`
              }
            </p>
          </div>
        )}

        {/* Logs List */}
        {!loading && logs.length > 0 && (
          <div className="space-y-4">
            {logs.map((log) => {
              const { icon: IconComponent, color, label, badgeColor } = getActionInfo(log.action);
              
              return (
                <div key={log.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ${color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <Badge className={badgeColor}>{label}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="ml-11 text-sm text-slate-600 bg-slate-50 rounded-md p-3 border border-slate-200">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <div className="font-medium">{key.replace(/_/g, ' ')}:</div>
                          <div className="col-span-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} logs
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