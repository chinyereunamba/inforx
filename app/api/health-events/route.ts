import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { healthEvents } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { z } from "zod";

const healthEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventType: z.enum(["symptom", "milestone", "measurement", "activity"]),
  severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
  eventDate: z.string().min(1, "Event date is required"),
  value: z.string().optional(),
  unit: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relatedRecordId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = db
      .select()
      .from(healthEvents)
      .where(eq(healthEvents.userId, userId));

    // Filter by event type
    if (eventType && eventType !== "all") {
      query = query.where(
        and(
          eq(healthEvents.userId, userId),
          eq(healthEvents.eventType, eventType)
        )
      );
    }

    // Filter by date range
    if (from) {
      query = query.where(
        and(
          eq(healthEvents.userId, userId),
          gte(healthEvents.eventDate, new Date(from))
        )
      );
    }

    if (to) {
      query = query.where(
        and(
          eq(healthEvents.userId, userId),
          lte(healthEvents.eventDate, new Date(to))
        )
      );
    }

    const events = await query.orderBy(desc(healthEvents.eventDate));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching health events:", error);
    return NextResponse.json(
      { error: "Failed to fetch health events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const validatedData = healthEventSchema.parse(body);

    const [newEvent] = await db
      .insert(healthEvents)
      .values({
        userId,
        title: validatedData.title,
        description: validatedData.description,
        eventType: validatedData.eventType,
        severity: validatedData.severity,
        eventDate: new Date(validatedData.eventDate),
        value: validatedData.value,
        unit: validatedData.unit,
        tags: validatedData.tags,
        relatedRecordId: validatedData.relatedRecordId || null,
      })
      .returning();

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating health event:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid health event data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create health event" },
      { status: 500 }
    );
  }
}
