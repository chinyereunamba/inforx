"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Pill,
  Stethoscope,
  Heart,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface ScheduledNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  scheduledFor: string;
  sentAt?: string;
  metadata: Record<string, any>;
}

interface ScheduleStats {
  total: number;
  pending: number;
  sent: number;
  overdue: number;
}

export default function NotificationSchedule() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>(
    []
  );
  const [stats, setStats] = useState<ScheduleStats>({
    total: 0,
    pending: 0,
    sent: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/send");
      const data = await response.json();

      if (data.success) {
        const notificationList = data.notifications || [];
        setNotifications(notificationList);
        calculateStats(notificationList);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notification schedule");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notificationList: ScheduledNotification[]) => {
    const now = new Date();

    const stats = notificationList.reduce(
      (acc, notification) => {
        acc.total++;

        if (notification.sentAt) {
          acc.sent++;
        } else {
          acc.pending++;

          const scheduledDate = new Date(notification.scheduledFor);
          if (isBefore(scheduledDate, now)) {
            acc.overdue++;
          }
        }

        return acc;
      },
      { total: 0, pending: 0, sent: 0, overdue: 0 }
    );

    setStats(stats);
  };

  const scheduleNotifications = async (types: string[]) => {
    setScheduling(true);
    try {
      const response = await fetch("/api/notifications/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ types }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notifications scheduled successfully");
        await loadNotifications();
      } else {
        throw new Error(data.error || "Failed to schedule notifications");
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      toast.error("Failed to schedule notifications");
    } finally {
      setScheduling(false);
    }
  };

  const processDueNotifications = async () => {
    setProcessing(true);
    try {
      const response = await fetch("/api/notifications/schedule");
      const data = await response.json();

      if (data.success) {
        toast.success("Due notifications processed");
        await loadNotifications();
      } else {
        throw new Error(data.error || "Failed to process notifications");
      }
    } catch (error) {
      console.error("Error processing notifications:", error);
      toast.error("Failed to process due notifications");
    } finally {
      setProcessing(false);
    }
  };

  const batchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeWindow: 30 }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notifications batched successfully");
        await loadNotifications();
      } else {
        throw new Error(data.error || "Failed to batch notifications");
      }
    } catch (error) {
      console.error("Error batching notifications:", error);
      toast.error("Failed to batch notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "medication_reminder":
        return <Pill className="h-4 w-4 text-blue-500" />;
      case "appointment_reminder":
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      case "health_checkup":
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationStatus = (notification: ScheduledNotification) => {
    if (notification.sentAt) {
      return <Badge variant="default">Sent</Badge>;
    }

    const scheduledDate = new Date(notification.scheduledFor);
    const now = new Date();

    if (isBefore(scheduledDate, now)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (isBefore(scheduledDate, addDays(now, 1))) {
      return <Badge variant="secondary">Due Soon</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const filterNotifications = (type: string) => {
    if (type === "all") return notifications;
    return notifications.filter((n) => n.type === type);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Notification Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sent
                </p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Schedule Management
          </CardTitle>
          <CardDescription>
            Manage your notification schedules and process due notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => scheduleNotifications(["medication"])}
              disabled={scheduling}
              variant="outline"
            >
              <Pill className="h-4 w-4 mr-2" />
              {scheduling ? "Scheduling..." : "Schedule Medication Reminders"}
            </Button>

            <Button
              onClick={() => scheduleNotifications(["appointment"])}
              disabled={scheduling}
              variant="outline"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              {scheduling ? "Scheduling..." : "Schedule Appointment Reminders"}
            </Button>

            <Button
              onClick={() => scheduleNotifications(["health_checkup"])}
              disabled={scheduling}
              variant="outline"
            >
              <Heart className="h-4 w-4 mr-2" />
              {scheduling ? "Scheduling..." : "Schedule Health Checkups"}
            </Button>

            <Button onClick={processDueNotifications} disabled={processing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${processing ? "animate-spin" : ""}`}
              />
              {processing ? "Processing..." : "Process Due Notifications"}
            </Button>

            <Button onClick={batchNotifications} variant="secondary">
              Batch Notifications
            </Button>
          </div>

          {stats.overdue > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {stats.overdue} overdue notifications that need to be
                processed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Notifications</CardTitle>
          <CardDescription>
            View and manage your upcoming and past notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="medication_reminder">Medications</TabsTrigger>
              <TabsTrigger value="appointment_reminder">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="health_checkup">Checkups</TabsTrigger>
            </TabsList>

            {[
              "all",
              "medication_reminder",
              "appointment_reminder",
              "health_checkup",
            ].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {filterNotifications(type).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications found for this category.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filterNotifications(type)
                      .sort(
                        (a, b) =>
                          new Date(b.scheduledFor).getTime() -
                          new Date(a.scheduledFor).getTime()
                      )
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getNotificationIcon(notification.type)}
                            <div>
                              <p className="font-medium">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Scheduled for:{" "}
                                {format(
                                  new Date(notification.scheduledFor),
                                  "PPp"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getNotificationStatus(notification)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
