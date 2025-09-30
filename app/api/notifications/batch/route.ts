import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { notificationScheduler } from "@/lib/services/notification-scheduler";

const batchNotificationsSchema = z.object({
  userId: z.string().uuid().optional(),
  timeWindow: z.number().min(5).max(120).default(30), // 5 minutes to 2 hours
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = batchNotificationsSchema.parse(body);

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

    // Batch notifications for the user
    await notificationScheduler.batchNotifications(
      targetUserId,
      validatedData.timeWindow
    );

    return NextResponse.json({
      success: true,
      message: "Notifications batched successfully",
      timeWindow: validatedData.timeWindow,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error batching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
