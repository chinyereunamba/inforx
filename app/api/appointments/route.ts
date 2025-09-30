import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { z } from "zod";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  doctorName: z.string().optional(),
  hospitalName: z.string().optional(),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  duration: z.number().min(15).max(480).default(30),
  type: z
    .enum(["consultation", "follow_up", "checkup", "procedure"])
    .default("consultation"),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId));

    // Filter by status
    if (status && status !== "all") {
      query = query.where(
        and(eq(appointments.userId, userId), eq(appointments.status, status))
      );
    }

    // Filter by date range
    if (from) {
      query = query.where(
        and(
          eq(appointments.userId, userId),
          gte(appointments.appointmentDate, new Date(from))
        )
      );
    }

    if (to) {
      query = query.where(
        and(
          eq(appointments.userId, userId),
          lte(appointments.appointmentDate, new Date(to))
        )
      );
    }

    const userAppointments = await query.orderBy(
      desc(appointments.appointmentDate)
    );

    return NextResponse.json({ appointments: userAppointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
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

    const validatedData = appointmentSchema.parse(body);

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        userId,
        title: validatedData.title,
        description: validatedData.description,
        doctorName: validatedData.doctorName,
        hospitalName: validatedData.hospitalName,
        appointmentDate: new Date(validatedData.appointmentDate),
        duration: validatedData.duration,
        type: validatedData.type,
        notes: validatedData.notes,
        status: "scheduled",
      })
      .returning();

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
