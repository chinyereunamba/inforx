"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Pill,
} from "lucide-react";
import {
  medicationService,
  Medication,
  MedicationReminder,
} from "@/lib/services/medication-service";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format, isToday, isTomorrow, addDays, startOfDay } from "date-fns";

interface MedicationRemindersProps {
  className?: string;
}

interface DailySchedule {
  date: Date;
  reminders: MedicationReminder[];
}

interface AdherenceStats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  streak: number;
}

export function MedicationReminders({ className }: MedicationRemindersProps) {
  const { user } = useAuthStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayReminders, setTodayReminders] = useState<MedicationReminder[]>(
    []
  );
  const [upcomingReminders, setUpcomingReminders] = useState<
    MedicationReminder[]
  >([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats>({
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0,
    adherenceRate: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateReminders = (
    medications: Medication[]
  ): MedicationReminder[] => {
    const reminders: MedicationReminder[] = [];
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    medications.forEach((medication) => {
      if (!medication.isActive || medication.reminderTimes.length === 0) return;

      medication.reminderTimes.forEach((time) => {
        reminders.push({
          id: `${medication.id}-${time}-${todayStr}`,
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          time,
          taken: false, // In a real app, this would come from a database
          date: todayStr,
        });
      });
    });

    return reminders.sort((a, b) => a.time.localeCompare(b.time));
  };

  const generateUpcomingReminders = (
    medications: Medication[]
  ): MedicationReminder[] => {
    const reminders: MedicationReminder[] = [];
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    medications.forEach((medication) => {
      if (!medication.isActive || medication.reminderTimes.length === 0) return;

      // Get next few reminders
      medication.reminderTimes.slice(0, 2).forEach((time) => {
        reminders.push({
          id: `${medication.id}-${time}-${tomorrowStr}`,
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          time,
          taken: false,
          date: tomorrowStr,
        });
      });
    });

    return reminders.sort((a, b) => a.time.localeCompare(b.time));
  };

  const calculateAdherenceStats = (
    medications: Medication[]
  ): AdherenceStats => {
    // Simplified calculation - in a real app, this would use actual tracking data
    const totalDoses = medications.reduce((sum, med) => {
      return sum + (med.isActive ? med.reminderTimes.length : 0);
    }, 0);

    const takenDoses = Math.floor(totalDoses * (0.8 + Math.random() * 0.2)); // Simulate 80-100% adherence
    const missedDoses = totalDoses - takenDoses;
    const adherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    const streak = Math.floor(Math.random() * 14) + 1; // Simulate streak

    return {
      totalDoses,
      takenDoses,
      missedDoses,
      adherenceRate,
      streak,
    };
  };

  const fetchMedicationsAndReminders = async () => {
    if (!user) return;

    try {
      setError(null);
      const medicationsData = await medicationService.getMedications(true); // Active only
      setMedications(medicationsData);

      const todayRems = generateReminders(medicationsData);
      const upcomingRems = generateUpcomingReminders(medicationsData);
      const stats = calculateAdherenceStats(medicationsData);

      setTodayReminders(todayRems);
      setUpcomingReminders(upcomingRems);
      setAdherenceStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const markReminderAsTaken = (reminderId: string) => {
    setTodayReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, taken: true } : reminder
      )
    );

    // Update adherence stats
    setAdherenceStats((prev) => ({
      ...prev,
      takenDoses: prev.takenDoses + 1,
      adherenceRate: Math.round(
        ((prev.takenDoses + 1) / prev.totalDoses) * 100
      ),
    }));
  };

  const markReminderAsMissed = (reminderId: string) => {
    setTodayReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, taken: false } : reminder
      )
    );
  };

  useEffect(() => {
    fetchMedicationsAndReminders();
  }, [user]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loading reminders...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const pendingReminders = todayReminders.filter((r) => !r.taken);
  const completedReminders = todayReminders.filter((r) => r.taken);
  const overdueReminders = pendingReminders.filter((r) => {
    const now = new Date();
    const [hours, minutes] = r.time.split(":").map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    return reminderTime < now;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-500" />
            Medication Reminders
          </h2>
          <p className="text-muted-foreground">
            Stay on track with your medication schedule
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Adherence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Adherence Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {adherenceStats.adherenceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Doses Taken</p>
                <p className="text-2xl font-bold">
                  {adherenceStats.takenDoses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Missed Doses</p>
                <p className="text-2xl font-bold text-red-600">
                  {adherenceStats.missedDoses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-purple-600">
                  {adherenceStats.streak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Reminders Alert */}
      {overdueReminders.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {overdueReminders.length} overdue medication
            {overdueReminders.length > 1 ? "s" : ""}. Please take them as soon
            as possible.
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Today's Reminders
          </CardTitle>
          {todayReminders.length > 0 && (
            <div className="flex items-center gap-2">
              <Progress
                value={
                  (completedReminders.length / todayReminders.length) * 100
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {completedReminders.length}/{todayReminders.length}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {todayReminders.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No medication reminders for today
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    reminder.taken
                      ? "bg-green-50 border-green-200"
                      : overdueReminders.includes(reminder)
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        reminder.taken
                          ? "bg-green-100 text-green-600"
                          : overdueReminders.includes(reminder)
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{reminder.medicationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.dosage} at {reminder.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {reminder.taken ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Taken
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => markReminderAsTaken(reminder.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Take
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markReminderAsMissed(reminder.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Tomorrow's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-3 p-2 rounded border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {reminder.medicationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.dosage} at {reminder.time}
                    </p>
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
