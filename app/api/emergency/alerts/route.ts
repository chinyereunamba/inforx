import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { emergencyAlertService } from "@/lib/services/emergency-alert-service";

const createAlertSchema = z.object({
  recordId: z.string().uuid().optional(),
  indicator: z.object({
    type: z.enum([
      "lab_result",
      "vital_sign",
      "medication_interaction",
      "symptom",
      "ai_analysis",
    ]),
    severity: z.enum(["high", "critical"]),
    finding: z.string().min(1),
    recommendation: z.string().min(1),
    source: z.string().min(1),
    confidence: z.number().min(0).max(1).optional(),
    metadata: z.record(z.any()).optional(),
  }),
  alertLevel: z.enum(["urgent", "critical", "emergency"]).default("critical"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

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

    // Create emergency alert
    const alert = await emergencyAlertService.createEmergencyAlert(
      userId,
      validatedData.indicator,
      validatedData.alertLevel
    );

    return NextResponse.json({
      success: true,
      alert,
      message: "Emergency alert created and sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid alert data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating emergency alert:", error);
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

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

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

    // Analyze critical health indicators
    const indicators =
      await emergencyAlertService.analyzeCriticalHealthIndicators(
        userId,
        recordId || undefined
      );

    return NextResponse.json({
      success: true,
      indicators,
      count: indicators.length,
    });
  } catch (error) {
    console.error("Error analyzing health indicators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
