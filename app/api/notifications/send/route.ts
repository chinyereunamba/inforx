import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  notifications,
  users,
  notificationPreferences,
  pushSubscriptions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { notificationService } from "@/lib/services/notification-service";

const sendNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.enum([
    "medication_reminder",
    "appointment_reminder",
    "critical_alert",
    "health_checkup",
  ]),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  scheduledFor: z.string().datetime().optional(),
  channels: z.array(z.enum(["email", "sms", "push"])).optional(),
  data: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendNotificationSchema.parse(body);

    // Get current user ID if not specified
    let targetUserId = validatedData.userId;

    if (!targetUserId) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

      if (!user.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      targetUserId = user[0].id;
    }

    // Get user details and preferences
    const userWithPreferences = await db
      .select({
        user: users,
        preferences: notificationPreferences,
      })
      .from(users)
      .leftJoin(
        notificationPreferences,
        eq(users.id, notificationPreferences.userId)
      )
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!userWithPreferences.length) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const { user: targetUser, preferences } = userWithPreferences[0];

    // Create notification record
    const notificationRecord = await db
      .insert(notifications)
      .values({
        userId: targetUserId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        scheduledFor: validatedData.scheduledFor
          ? new Date(validatedData.scheduledFor)
          : new Date(),
        channels: {
          email:
            validatedData.channels?.includes("email") ??
            preferences?.email ??
            true,
          sms:
            validatedData.channels?.includes("sms") ??
            preferences?.sms ??
            false,
          push:
            validatedData.channels?.includes("push") ??
            preferences?.push ??
            true,
        },
        metadata: validatedData.data || {},
      })
      .returning();

    // If scheduled for future, just save and return
    if (
      validatedData.scheduledFor &&
      new Date(validatedData.scheduledFor) > new Date()
    ) {
      return NextResponse.json({
        success: true,
        notification: notificationRecord[0],
        message: "Notification scheduled successfully",
      });
    }

    // Send notification immediately
    const channels = [];

    // Prepare email channel
    if (notificationRecord[0].channels.email && targetUser.email) {
      channels.push({
        type: "email" as const,
        enabled: true,
        address: targetUser.email,
      });
    }

    // Prepare SMS channel
    if (notificationRecord[0].channels.sms && targetUser.phoneNumber) {
      channels.push({
        type: "sms" as const,
        enabled: true,
        address: targetUser.phoneNumber,
      });
    }

    // Prepare push channel
    if (notificationRecord[0].channels.push) {
      channels.push({
        type: "push" as const,
        enabled: true,
      });
    }

    // Get notification template
    const templates = notificationService.getDefaultTemplates();
    const template = templates.find((t) => t.type === validatedData.type);

    if (!template) {
      return NextResponse.json(
        { error: "Notification template not found" },
        { status: 400 }
      );
    }

    // Send notification
    const sendResult = await notificationService.sendMultiChannelNotification(
      {
        userId: targetUserId,
        type: validatedData.type,
        priority: validatedData.priority,
        data: {
          patientName: targetUser.fullName || "Patient",
          ...validatedData.data,
        },
      },
      channels,
      template
    );

    // Update notification record with sent status
    await db
      .update(notifications)
      .set({
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationRecord[0].id));

    return NextResponse.json({
      success: true,
      notification: notificationRecord[0],
      sendResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

    // Get user's notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
