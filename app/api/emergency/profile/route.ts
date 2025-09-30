import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { emergencyAlertService } from "@/lib/services/emergency-alert-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const emergencyAccess = searchParams.get("emergency") === "true";

    // For emergency access, allow without full authentication
    if (emergencyAccess && userId) {
      try {
        const emergencyProfile =
          await emergencyAlertService.createEmergencyProfile(userId);

        // Return limited profile for emergency access
        return NextResponse.json({
          success: true,
          profile: {
            personalInfo: emergencyProfile.personalInfo,
            medicalInfo: {
              allergies: emergencyProfile.medicalInfo.allergies,
              chronicConditions: emergencyProfile.medicalInfo.chronicConditions,
              bloodType: emergencyProfile.medicalInfo.bloodType,
              currentMedications:
                emergencyProfile.medicalInfo.currentMedications,
            },
            emergencyContact: emergencyProfile.emergencyContact,
            lastUpdated: emergencyProfile.lastUpdated,
          },
          emergencyAccess: true,
        });
      } catch (error) {
        return NextResponse.json(
          { error: "Emergency profile not found" },
          { status: 404 }
        );
      }
    }

    // Regular authenticated access
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    let targetUserId = userId;

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

    // Create complete emergency profile
    const emergencyProfile = await emergencyAlertService.createEmergencyProfile(
      targetUserId
    );

    return NextResponse.json({
      success: true,
      profile: emergencyProfile,
      emergencyAccess: false,
    });
  } catch (error) {
    console.error("Error getting emergency profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
