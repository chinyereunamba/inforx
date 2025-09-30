"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { MedicationManager } from "@/components/dashboard/MedicationManager";
import { MedicationReminders } from "@/components/dashboard/MedicationReminders";
import { AppointmentTracker } from "@/components/dashboard/AppointmentTracker";
import { HealthGoals } from "@/components/dashboard/HealthGoals";
import { BarChart3, Pill, Bell, Calendar, Target } from "lucide-react";

export default function HealthDashboardPage() {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Health Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive view of your health data, medications, appointments, and
          goals
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <DashboardAnalytics />
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <MedicationManager />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <MedicationReminders />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentTracker />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <HealthGoals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
