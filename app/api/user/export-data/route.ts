import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  medicalRecords,
  medicalSummaries,
  medications,
  notifications,
  auditLogs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const userProfile = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        dateOfBirth: users.dateOfBirth,
        gender: users.gender,
        emergencyContact: users.emergencyContact,
        medicalHistory: users.medicalHistory,
        preferences: users.preferences,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userProfile[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user allows data export
    if (!userProfile[0].preferences?.privacy?.allowDataExport) {
      return NextResponse.json(
        { error: "Data export is disabled in your privacy settings" },
        { status: 403 }
      );
    }

    // Get medical records
    const userMedicalRecords = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.userId, session.user.id));

    // Get medical summaries
    const userMedicalSummaries = await db
      .select()
      .from(medicalSummaries)
      .where(eq(medicalSummaries.userId, session.user.id));

    // Get medications
    const userMedications = await db
      .select()
      .from(medications)
      .where(eq(medications.userId, session.user.id));

    // Get notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id));

    // Get audit logs (last 100 entries)
    const userAuditLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, session.user.id))
      .orderBy(auditLogs.createdAt)
      .limit(100);

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userProfile[0],
      medicalRecords: userMedicalRecords,
      medicalSummaries: userMedicalSummaries,
      medications: userMedications,
      notifications: userNotifications,
      auditLogs: userAuditLogs,
      metadata: {
        totalRecords: userMedicalRecords.length,
        totalSummaries: userMedicalSummaries.length,
        totalMedications: userMedications.length,
        totalNotifications: userNotifications.length,
        totalAuditLogs: userAuditLogs.length,
      },
    };

    // Create audit log for data export
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: "data_export",
      resourceType: "user",
      resourceId: session.user.id,
      ipAddress:
        request.ip || request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // Return as downloadable JSON
    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="inforx-data-export-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
