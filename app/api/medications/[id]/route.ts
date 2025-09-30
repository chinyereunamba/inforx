import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { medications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  reminderTimes: z.array(z.string()).optional(),
  sideEffects: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const medicationId = params.id;

    const [medication] = await db
      .select()
      .from(medications)
      .where(
        and(eq(medications.id, medicationId), eq(medications.userId, userId))
      )
      .limit(1);

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ medication });
  } catch (error) {
    console.error("Error fetching medication:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const medicationId = params.id;
    const body = await request.json();

    const validatedData = updateMedicationSchema.parse(body);

    // Check if medication exists and belongs to user
    const [existingMedication] = await db
      .select({ id: medications.id })
      .from(medications)
      .where(
        and(eq(medications.id, medicationId), eq(medications.userId, userId))
      )
      .limit(1);

    if (!existingMedication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.dosage !== undefined)
      updateData.dosage = validatedData.dosage;
    if (validatedData.frequency !== undefined)
      updateData.frequency = validatedData.frequency;
    if (validatedData.duration !== undefined)
      updateData.duration = validatedData.duration;
    if (validatedData.instructions !== undefined)
      updateData.instructions = validatedData.instructions;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;
    if (validatedData.reminderTimes !== undefined)
      updateData.reminderTimes = validatedData.reminderTimes;
    if (validatedData.sideEffects !== undefined)
      updateData.sideEffects = validatedData.sideEffects;
    if (validatedData.interactions !== undefined)
      updateData.interactions = validatedData.interactions;

    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate
        ? new Date(validatedData.startDate)
        : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate
        ? new Date(validatedData.endDate)
        : null;
    }

    const [updatedMedication] = await db
      .update(medications)
      .set(updateData)
      .where(
        and(eq(medications.id, medicationId), eq(medications.userId, userId))
      )
      .returning();

    return NextResponse.json({ medication: updatedMedication });
  } catch (error) {
    console.error("Error updating medication:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid medication data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const medicationId = params.id;

    // Check if medication exists and belongs to user
    const [existingMedication] = await db
      .select({ id: medications.id })
      .from(medications)
      .where(
        and(eq(medications.id, medicationId), eq(medications.userId, userId))
      )
      .limit(1);

    if (!existingMedication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    await db
      .delete(medications)
      .where(
        and(eq(medications.id, medicationId), eq(medications.userId, userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    );
  }
}
