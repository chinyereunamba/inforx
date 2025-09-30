import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { notificationScheduler } from "@/lib/services/notification-scheduler";

const scheduleNotificationsSchema = z.object({
  types: z
    .array(z.enum(["medication", "appointment", "health_checkup"]))
    .optional(),
  userId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scheduleNotificationsSchema.parse(body);

    // Get user ID
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

    const types = validatedData.types || [
      "medication",
      "appointment",
      "health_checkup",
    ];
    const results: Record<string, { success: boolean; error?: string }> = {};

    // Schedule notifications based on requested types
    for (const type of types) {
      try {
        switch (type) {
          case "medication":
            await notificationScheduler.scheduleMedicationReminders(
              targetUserId
            );
            results.medication = { success: true };
            break;

          case "appointment":
            await notificationScheduler.scheduleAppointmentReminders(
              targetUserId
            );
            results.appointment = { success: true };
            break;

          case "health_checkup":
            await notificationScheduler.scheduleHealthCheckupReminders(
              targetUserId
            );
            results.health_checkup = { success: true };
            break;
        }
      } catch (error) {
        console.error(`Error scheduling ${type} notifications:`, error);
        results[type] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Notification scheduling completed",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error scheduling notifications:", error);
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

    // Process due notifications
    await notificationScheduler.processDueNotifications();

    return NextResponse.json({
      success: true,
      message: "Due notifications processed",
    });
  } catch (error) {
    console.error("Error processing due notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
