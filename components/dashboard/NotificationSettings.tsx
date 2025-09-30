"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Shield,
} from "lucide-react";
import { pushNotificationManager } from "@/lib/utils/push-notifications";
import { toast } from "sonner";

interface NotificationPreferences {
  id?: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  criticalAlerts: boolean;
  healthCheckups: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

const timezones = [
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
  { value: "Africa/Abuja", label: "Abuja (WAT)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "Europe/London", label: "London (GMT)" },
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    medicationReminders: true,
    appointmentReminders: true,
    criticalAlerts: true,
    healthCheckups: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    timezone: "Africa/Lagos",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPushSupport();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      const data = await response.json();

      if (data.success && data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = async () => {
    const supported = pushNotificationManager.isSupported();
    setPushSupported(supported);

    if (supported) {
      const subscription = await pushNotificationManager.getSubscription();
      setPushSubscribed(!!subscription);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notification preferences saved successfully");
        setPreferences(data.preferences);
      } else {
        throw new Error(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && !pushSubscribed) {
      try {
        const subscription = await pushNotificationManager.subscribe();
        if (subscription) {
          setPushSubscribed(true);
          setPreferences((prev) => ({ ...prev, push: true }));
          toast.success("Push notifications enabled successfully");
        } else {
          toast.error("Failed to enable push notifications");
        }
      } catch (error) {
        console.error("Error enabling push notifications:", error);
        toast.error("Failed to enable push notifications");
      }
    } else if (!enabled && pushSubscribed) {
      try {
        const success = await pushNotificationManager.unsubscribe();
        if (success) {
          setPushSubscribed(false);
          setPreferences((prev) => ({ ...prev, push: false }));
          toast.success("Push notifications disabled successfully");
        } else {
          toast.error("Failed to disable push notifications");
        }
      } catch (error) {
        console.error("Error disabling push notifications:", error);
        toast.error("Failed to disable push notifications");
      }
    } else {
      setPreferences((prev) => ({ ...prev, push: enabled }));
    }
  };

  const testNotification = async () => {
    setTestingNotification(true);
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "health_checkup",
          title: "Test Notification",
          message: "This is a test notification from InfoRx",
          priority: "medium",
          data: {
            checkupType: "general",
            recommendedDate: new Date().toLocaleDateString(),
            reason: "Testing notification system",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test notification sent successfully");
      } else {
        throw new Error(data.error || "Failed to send test notification");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    } finally {
      setTestingNotification(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications from InfoRx
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, email: checked }))
              }
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <Label className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive critical notifications via SMS
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.sms}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, sms: checked }))
              }
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <div>
                <Label className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive instant notifications in your browser
                </p>
                {!pushSupported && (
                  <Badge variant="secondary" className="mt-1">
                    Not Supported
                  </Badge>
                )}
                {pushSupported && pushSubscribed && (
                  <Badge variant="default" className="mt-1">
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <Switch
              checked={preferences.push && pushSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={!pushSupported}
            />
          </div>

          {!pushSupported && (
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertDescription>
                Push notifications are not supported in your current browser.
                Please use a modern browser like Chrome, Firefox, or Safari.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Control which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Medication Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders to take your medications on time
              </p>
            </div>
            <Switch
              checked={preferences.medicationReminders}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  medicationReminders: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Appointment Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders for upcoming medical appointments
              </p>
            </div>
            <Switch
              checked={preferences.appointmentReminders}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  appointmentReminders: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Critical Health Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Urgent notifications about critical health findings
              </p>
            </div>
            <Switch
              checked={preferences.criticalAlerts}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, criticalAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Health Checkup Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders for routine health checkups and screenings
              </p>
            </div>
            <Switch
              checked={preferences.healthCheckups}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, healthCheckups: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours & Timezone
          </CardTitle>
          <CardDescription>
            Set your quiet hours and timezone preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quietStart">Quiet Hours Start</Label>
              <Input
                id="quietStart"
                type="time"
                value={preferences.quietHoursStart}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHoursStart: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="quietEnd">Quiet Hours End</Label>
              <Input
                id="quietEnd"
                type="time"
                value={preferences.quietHoursEnd}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHoursEnd: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        <Button
          variant="outline"
          onClick={testNotification}
          disabled={testingNotification}
        >
          {testingNotification ? "Sending..." : "Test Notification"}
        </Button>
      </div>
    </div>
  );
}
