import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationPreferences, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  push: z.boolean().optional(),
  medicationReminders: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  criticalAlerts: z.boolean().optional(),
  healthCheckups: z.boolean().optional(),
  quietHoursStart: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  timezone: z.string().optional(),
});

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

    // Get notification preferences
    let preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    // If no preferences exist, create default ones
    if (!preferences.length) {
      const defaultPreferences = await db
        .insert(notificationPreferences)
        .values({
          userId,
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
        })
        .returning();

      preferences = defaultPreferences;
    }

    return NextResponse.json({
      success: true,
      preferences: preferences[0],
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = notificationPreferencesSchema.parse(body);

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

    // Check if preferences exist
    const existingPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    let updatedPreferences;

    if (existingPreferences.length) {
      // Update existing preferences
      updatedPreferences = await db
        .update(notificationPreferences)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
    } else {
      // Create new preferences
      updatedPreferences = await db
        .insert(notificationPreferences)
        .values({
          userId,
          ...validatedData,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
