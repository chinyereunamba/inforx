import { db } from "@/lib/db";
import {
  medications,
  appointments,
  notifications,
  notificationPreferences,
  users,
  healthEvents,
} from "@/lib/db/schema";
import { eq, and, gte, lte, isNull, or } from "drizzle-orm";
import { notificationService } from "./notification-service";
import {
  addDays,
  addHours,
  addMinutes,
  format,
  parseISO,
  isAfter,
  isBefore,
} from "date-fns";

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: "medication_reminder" | "appointment_reminder" | "health_checkup";
  scheduledFor: Date;
  data: Record<string, any>;
  priority: "low" | "medium" | "high" | "critical";
}

export interface MedicationSchedule {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  startDate: Date;
  endDate?: Date;
}

export interface AppointmentReminder {
  appointmentId: string;
  title: string;
  doctorName?: string;
  hospitalName?: string;
  appointmentDate: Date;
  reminderOffsets: number[]; // Hours before appointment
}

export interface HealthCheckupReminder {
  userId: string;
  checkupType: string;
  lastCheckup?: Date;
  recommendedInterval: number; // Days
  priority: "low" | "medium" | "high";
}

export class NotificationScheduler {
  private static instance: NotificationScheduler;

  private constructor() {}

  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  /**
   * Schedule medication reminders based on prescription data
   */
  async scheduleMedicationReminders(userId: string): Promise<void> {
    try {
      // Get active medications for user
      const userMedications = await db
        .select()
        .from(medications)
        .where(
          and(
            eq(medications.userId, userId),
            eq(medications.isActive, true),
            or(
              isNull(medications.endDate),
              gte(medications.endDate, new Date().toISOString().split("T")[0])
            )
          )
        );

      // Get user preferences
      const userPrefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      const preferences = userPrefs[0];

      if (!preferences?.medicationReminders) {
        console.log("Medication reminders disabled for user:", userId);
        return;
      }

      // Clear existing medication reminders
      await this.clearScheduledNotifications(userId, "medication_reminder");

      // Schedule new reminders
      for (const medication of userMedications) {
        await this.scheduleMedicationReminderForMedication(
          medication,
          preferences
        );
      }

      console.log(
        `Scheduled medication reminders for ${userMedications.length} medications`
      );
    } catch (error) {
      console.error("Error scheduling medication reminders:", error);
      throw error;
    }
  }

  /**
   * Schedule appointment reminders
   */
  async scheduleAppointmentReminders(userId: string): Promise<void> {
    try {
      // Get upcoming appointments
      const upcomingAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, userId),
            gte(appointments.appointmentDate, new Date()),
            eq(appointments.status, "scheduled")
          )
        );

      // Get user preferences
      const userPrefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      const preferences = userPrefs[0];

      if (!preferences?.appointmentReminders) {
        console.log("Appointment reminders disabled for user:", userId);
        return;
      }

      // Clear existing appointment reminders
      await this.clearScheduledNotifications(userId, "appointment_reminder");

      // Schedule reminders for each appointment
      for (const appointment of upcomingAppointments) {
        await this.scheduleAppointmentReminderForAppointment(
          appointment,
          preferences
        );
      }

      console.log(
        `Scheduled appointment reminders for ${upcomingAppointments.length} appointments`
      );
    } catch (error) {
      console.error("Error scheduling appointment reminders:", error);
      throw error;
    }
  }

  /**
   * Schedule health checkup reminders based on medical history and age
   */
  async scheduleHealthCheckupReminders(userId: string): Promise<void> {
    try {
      // Get user details
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error("User not found");
      }

      const userData = user[0];

      // Get user preferences
      const userPrefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      const preferences = userPrefs[0];

      if (!preferences?.healthCheckups) {
        console.log("Health checkup reminders disabled for user:", userId);
        return;
      }

      // Calculate age and determine recommended checkups
      const age = userData.dateOfBirth
        ? this.calculateAge(new Date(userData.dateOfBirth))
        : null;

      const recommendedCheckups = this.getRecommendedCheckups(
        age,
        userData.gender,
        userData.medicalHistory
      );

      // Clear existing health checkup reminders
      await this.clearScheduledNotifications(userId, "health_checkup");

      // Schedule checkup reminders
      for (const checkup of recommendedCheckups) {
        await this.scheduleHealthCheckupReminder(userId, checkup, preferences);
      }

      console.log(
        `Scheduled ${recommendedCheckups.length} health checkup reminders`
      );
    } catch (error) {
      console.error("Error scheduling health checkup reminders:", error);
      throw error;
    }
  }

  /**
   * Process and send due notifications
   */
  async processDueNotifications(): Promise<void> {
    try {
      const now = new Date();

      // Get notifications that are due to be sent
      const dueNotifications = await db
        .select({
          notification: notifications,
          user: users,
          preferences: notificationPreferences,
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.userId, users.id))
        .leftJoin(
          notificationPreferences,
          eq(notifications.userId, notificationPreferences.userId)
        )
        .where(
          and(
            lte(notifications.scheduledFor, now),
            isNull(notifications.sentAt)
          )
        );

      console.log(`Processing ${dueNotifications.length} due notifications`);

      for (const { notification, user, preferences } of dueNotifications) {
        if (!user) continue;

        try {
          // Check quiet hours
          if (preferences && this.isInQuietHours(now, preferences)) {
            // Reschedule for after quiet hours
            const nextSendTime = this.getNextSendTimeAfterQuietHours(
              now,
              preferences
            );

            await db
              .update(notifications)
              .set({
                scheduledFor: nextSendTime,
                updatedAt: new Date(),
              })
              .where(eq(notifications.id, notification.id));

            continue;
          }

          // Send notification
          await this.sendScheduledNotification(notification, user, preferences);

          // Mark as sent
          await db
            .update(notifications)
            .set({
              sentAt: now,
              updatedAt: now,
            })
            .where(eq(notifications.id, notification.id));
        } catch (error) {
          console.error(
            `Error sending notification ${notification.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error processing due notifications:", error);
      throw error;
    }
  }

  /**
   * Batch notifications to avoid overwhelming users
   */
  async batchNotifications(
    userId: string,
    timeWindow: number = 30
  ): Promise<void> {
    try {
      const now = new Date();
      const windowEnd = addMinutes(now, timeWindow);

      // Get notifications in the time window
      const notificationsInWindow = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            gte(notifications.scheduledFor, now),
            lte(notifications.scheduledFor, windowEnd),
            isNull(notifications.sentAt)
          )
        );

      if (notificationsInWindow.length <= 1) {
        return; // No batching needed
      }

      // Group notifications by type
      const groupedNotifications = notificationsInWindow.reduce(
        (groups, notification) => {
          const type = notification.type;
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push(notification);
          return groups;
        },
        {} as Record<string, typeof notificationsInWindow>
      );

      // Create batched notifications
      for (const [type, notifications] of Object.entries(
        groupedNotifications
      )) {
        if (notifications.length > 1) {
          await this.createBatchedNotification(userId, type, notifications);

          // Mark individual notifications as sent (batched)
          for (const notification of notifications) {
            await db
              .update(notifications)
              .set({
                sentAt: now,
                updatedAt: now,
              })
              .where(eq(notifications.id, notification.id));
          }
        }
      }
    } catch (error) {
      console.error("Error batching notifications:", error);
      throw error;
    }
  }

  /**
   * Schedule medication reminder for a specific medication
   */
  private async scheduleMedicationReminderForMedication(
    medication: any,
    preferences: any
  ): Promise<void> {
    const reminderTimes = medication.reminderTimes || [];

    if (reminderTimes.length === 0) {
      // Generate default reminder times based on frequency
      const defaultTimes = this.generateDefaultReminderTimes(
        medication.frequency
      );
      reminderTimes.push(...defaultTimes);
    }

    const startDate = medication.startDate
      ? new Date(medication.startDate)
      : new Date();
    const endDate = medication.endDate
      ? new Date(medication.endDate)
      : addDays(new Date(), 30);

    // Schedule reminders for each day until end date
    let currentDate = startDate;

    while (isBefore(currentDate, endDate)) {
      for (const time of reminderTimes) {
        const [hours, minutes] = time.split(":").map(Number);
        const reminderDateTime = new Date(currentDate);
        reminderDateTime.setHours(hours, minutes, 0, 0);

        // Only schedule future reminders
        if (isAfter(reminderDateTime, new Date())) {
          await db.insert(notifications).values({
            userId: medication.userId,
            type: "medication_reminder",
            title: "Medication Reminder",
            message: `Time to take your medication: ${medication.name}`,
            scheduledFor: reminderDateTime,
            channels: {
              email: preferences.email,
              sms: preferences.sms,
              push: preferences.push,
            },
            metadata: {
              medicationId: medication.id,
              medicationName: medication.name,
              dosage: medication.dosage,
              instructions: medication.instructions,
            },
          });
        }
      }

      currentDate = addDays(currentDate, 1);
    }
  }

  /**
   * Schedule appointment reminder for a specific appointment
   */
  private async scheduleAppointmentReminderForAppointment(
    appointment: any,
    preferences: any
  ): Promise<void> {
    const appointmentDate = new Date(appointment.appointmentDate);
    const reminderOffsets = [24, 1]; // 24 hours and 1 hour before

    for (const offsetHours of reminderOffsets) {
      const reminderTime = addHours(appointmentDate, -offsetHours);

      // Only schedule future reminders
      if (isAfter(reminderTime, new Date())) {
        await db.insert(notifications).values({
          userId: appointment.userId,
          type: "appointment_reminder",
          title: "Appointment Reminder",
          message: `You have an appointment ${
            offsetHours === 1 ? "in 1 hour" : "tomorrow"
          }`,
          scheduledFor: reminderTime,
          channels: {
            email: preferences.email,
            sms: preferences.sms,
            push: preferences.push,
          },
          metadata: {
            appointmentId: appointment.id,
            doctorName: appointment.doctorName,
            hospitalName: appointment.hospitalName,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: format(appointmentDate, "HH:mm"),
            location: appointment.hospitalName,
          },
        });
      }
    }
  }

  /**
   * Schedule health checkup reminder
   */
  private async scheduleHealthCheckupReminder(
    userId: string,
    checkup: HealthCheckupReminder,
    preferences: any
  ): Promise<void> {
    const reminderDate = checkup.lastCheckup
      ? addDays(new Date(checkup.lastCheckup), checkup.recommendedInterval)
      : addDays(new Date(), 7); // Default to 1 week from now

    // Only schedule future reminders
    if (isAfter(reminderDate, new Date())) {
      await db.insert(notifications).values({
        userId,
        type: "health_checkup",
        title: "Health Checkup Reminder",
        message: `It's time for your ${checkup.checkupType} checkup`,
        scheduledFor: reminderDate,
        channels: {
          email: preferences.email,
          sms: false, // Health checkups are usually not urgent
          push: preferences.push,
        },
        metadata: {
          checkupType: checkup.checkupType,
          recommendedDate: format(reminderDate, "yyyy-MM-dd"),
          reason: `Recommended ${checkup.checkupType} checkup`,
        },
      });
    }
  }

  /**
   * Clear scheduled notifications of a specific type
   */
  private async clearScheduledNotifications(
    userId: string,
    type: string
  ): Promise<void> {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.type, type),
          isNull(notifications.sentAt)
        )
      );
  }

  /**
   * Generate default reminder times based on frequency
   */
  private generateDefaultReminderTimes(frequency: string): string[] {
    const lowerFreq = frequency.toLowerCase();

    if (lowerFreq.includes("once") || lowerFreq.includes("daily")) {
      return ["08:00"];
    } else if (lowerFreq.includes("twice") || lowerFreq.includes("2")) {
      return ["08:00", "20:00"];
    } else if (lowerFreq.includes("three") || lowerFreq.includes("3")) {
      return ["08:00", "14:00", "20:00"];
    } else if (lowerFreq.includes("four") || lowerFreq.includes("4")) {
      return ["08:00", "12:00", "16:00", "20:00"];
    } else {
      return ["08:00"]; // Default
    }
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get recommended checkups based on age, gender, and medical history
   */
  private getRecommendedCheckups(
    age: number | null,
    gender: string | null,
    medicalHistory: any
  ): HealthCheckupReminder[] {
    const checkups: HealthCheckupReminder[] = [];

    if (!age) return checkups;

    // General checkups for all adults
    if (age >= 18) {
      checkups.push({
        userId: "",
        checkupType: "general physical",
        recommendedInterval: 365, // Yearly
        priority: "medium",
      });
    }

    // Blood pressure screening
    if (age >= 18) {
      checkups.push({
        userId: "",
        checkupType: "blood pressure screening",
        recommendedInterval: 730, // Every 2 years
        priority: "medium",
      });
    }

    // Cholesterol screening
    if (
      age >= 35 ||
      (age >= 20 && medicalHistory?.chronicConditions?.includes("diabetes"))
    ) {
      checkups.push({
        userId: "",
        checkupType: "cholesterol screening",
        recommendedInterval: 1825, // Every 5 years
        priority: "medium",
      });
    }

    // Gender-specific checkups
    if (gender === "female") {
      if (age >= 21) {
        checkups.push({
          userId: "",
          checkupType: "cervical cancer screening",
          recommendedInterval: 1095, // Every 3 years
          priority: "high",
        });
      }

      if (age >= 50) {
        checkups.push({
          userId: "",
          checkupType: "mammogram",
          recommendedInterval: 730, // Every 2 years
          priority: "high",
        });
      }
    }

    if (gender === "male") {
      if (age >= 50) {
        checkups.push({
          userId: "",
          checkupType: "prostate screening",
          recommendedInterval: 365, // Yearly
          priority: "medium",
        });
      }
    }

    // Age-specific checkups
    if (age >= 50) {
      checkups.push({
        userId: "",
        checkupType: "colorectal cancer screening",
        recommendedInterval: 3650, // Every 10 years
        priority: "high",
      });
    }

    if (age >= 65) {
      checkups.push({
        userId: "",
        checkupType: "bone density screening",
        recommendedInterval: 730, // Every 2 years
        priority: "medium",
      });
    }

    return checkups;
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(currentTime: Date, preferences: any): boolean {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = preferences.quietHoursStart
      .split(":")
      .map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd
      .split(":")
      .map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    if (startTimeMinutes <= endTimeMinutes) {
      // Same day quiet hours (e.g., 22:00 to 23:00)
      return (
        currentTimeMinutes >= startTimeMinutes &&
        currentTimeMinutes <= endTimeMinutes
      );
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return (
        currentTimeMinutes >= startTimeMinutes ||
        currentTimeMinutes <= endTimeMinutes
      );
    }
  }

  /**
   * Get next send time after quiet hours
   */
  private getNextSendTimeAfterQuietHours(
    currentTime: Date,
    preferences: any
  ): Date {
    const [endHour, endMinute] = preferences.quietHoursEnd
      .split(":")
      .map(Number);

    const nextSendTime = new Date(currentTime);
    nextSendTime.setHours(endHour, endMinute, 0, 0);

    // If the end time is earlier in the day, it means it's the next day
    if (nextSendTime <= currentTime) {
      nextSendTime.setDate(nextSendTime.getDate() + 1);
    }

    return nextSendTime;
  }

  /**
   * Send a scheduled notification
   */
  private async sendScheduledNotification(
    notification: any,
    user: any,
    preferences: any
  ): Promise<void> {
    const channels = [];

    if (notification.channels.email && user.email) {
      channels.push({
        type: "email" as const,
        enabled: true,
        address: user.email,
      });
    }

    if (notification.channels.sms && user.phoneNumber) {
      channels.push({
        type: "sms" as const,
        enabled: true,
        address: user.phoneNumber,
      });
    }

    if (notification.channels.push) {
      channels.push({
        type: "push" as const,
        enabled: true,
      });
    }

    const templates = notificationService.getDefaultTemplates();
    const template = templates.find((t) => t.type === notification.type);

    if (template) {
      await notificationService.sendMultiChannelNotification(
        {
          userId: notification.userId,
          type: notification.type,
          priority: "medium",
          data: {
            patientName: user.fullName || "Patient",
            ...notification.metadata,
          },
        },
        channels,
        template
      );
    }
  }

  /**
   * Create a batched notification
   */
  private async createBatchedNotification(
    userId: string,
    type: string,
    notifications: any[]
  ): Promise<void> {
    const batchTitle = `${notifications.length} ${type.replace(
      "_",
      " "
    )} notifications`;
    const batchMessage = notifications.map((n) => n.title).join(", ");

    await db.insert(notifications).values({
      userId,
      type: "batched",
      title: batchTitle,
      message: batchMessage,
      scheduledFor: new Date(),
      channels: {
        email: true,
        sms: false,
        push: true,
      },
      metadata: {
        batchedNotifications: notifications.map((n) => n.id),
        originalType: type,
      },
    });
  }
}

export const notificationScheduler = NotificationScheduler.getInstance();
