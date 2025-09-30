import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { medications, medicalRecords } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reminderTimes: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  interactions: z.array(z.string()).default([]),
  recordId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let query = db
      .select({
        id: medications.id,
        name: medications.name,
        dosage: medications.dosage,
        frequency: medications.frequency,
        duration: medications.duration,
        instructions: medications.instructions,
        startDate: medications.startDate,
        endDate: medications.endDate,
        isActive: medications.isActive,
        reminderTimes: medications.reminderTimes,
        sideEffects: medications.sideEffects,
        interactions: medications.interactions,
        recordId: medications.recordId,
        createdAt: medications.createdAt,
        updatedAt: medications.updatedAt,
      })
      .from(medications)
      .where(eq(medications.userId, userId));

    if (activeOnly) {
      query = query.where(
        and(eq(medications.userId, userId), eq(medications.isActive, true))
      );
    }

    const userMedications = await query.orderBy(desc(medications.createdAt));

    return NextResponse.json({ medications: userMedications });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: "Failed to fetch medications" },
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

    const validatedData = medicationSchema.parse(body);

    // Verify record ownership if recordId is provided
    if (validatedData.recordId) {
      const record = await db
        .select({ id: medicalRecords.id })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.id, validatedData.recordId),
            eq(medicalRecords.userId, userId)
          )
        )
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: "Medical record not found or access denied" },
          { status: 404 }
        );
      }
    }

    const [newMedication] = await db
      .insert(medications)
      .values({
        userId,
        name: validatedData.name,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        duration: validatedData.duration,
        instructions: validatedData.instructions,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        reminderTimes: validatedData.reminderTimes,
        sideEffects: validatedData.sideEffects,
        interactions: validatedData.interactions,
        recordId: validatedData.recordId || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ medication: newMedication }, { status: 201 });
  } catch (error) {
    console.error("Error creating medication:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid medication data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    );
  }
}
