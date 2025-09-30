import { NextRequest, NextResponse } from "next/server";
import { notificationScheduler } from "@/lib/services/notification-scheduler";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (in production, you might want to add authentication)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Processing scheduled notifications...");

    // Process due notifications
    await notificationScheduler.processDueNotifications();

    return NextResponse.json({
      success: true,
      message: "Scheduled notifications processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in notification cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow POST requests as well for flexibility
  return GET(request);
}
