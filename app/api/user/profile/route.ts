import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  emergencyContact: z
    .object({
      name: z.string().min(2, "Emergency contact name is required"),
      relationship: z.string().min(2, "Relationship is required"),
      phoneNumber: z.string().min(10, "Valid phone number is required"),
      email: z.string().email().optional(),
    })
    .optional(),
  medicalHistory: z
    .object({
      allergies: z.array(z.string()).optional(),
      chronicConditions: z.array(z.string()).optional(),
      currentMedications: z.array(z.string()).optional(),
      bloodType: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      notifications: z
        .object({
          email: z.boolean(),
          sms: z.boolean(),
          push: z.boolean(),
        })
        .optional(),
      privacy: z
        .object({
          shareWithEmergencyContacts: z.boolean(),
          allowDataExport: z.boolean(),
        })
        .optional(),
    })
    .optional(),
});

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
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

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: user[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Get current user data for audit log
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.fullName !== undefined) {
      updateData.fullName = validatedData.fullName;
    }
    if (validatedData.phoneNumber !== undefined) {
      updateData.phoneNumber = validatedData.phoneNumber;
    }
    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth
        ? new Date(validatedData.dateOfBirth)
        : null;
    }
    if (validatedData.gender !== undefined) {
      updateData.gender = validatedData.gender;
    }
    if (validatedData.emergencyContact !== undefined) {
      updateData.emergencyContact = validatedData.emergencyContact;
    }
    if (validatedData.medicalHistory !== undefined) {
      updateData.medicalHistory = validatedData.medicalHistory;
    }
    if (validatedData.preferences !== undefined) {
      // Merge with existing preferences
      const currentPreferences = currentUser[0].preferences || {
        notifications: { email: true, sms: false, push: true },
        privacy: { shareWithEmergencyContacts: false, allowDataExport: true },
      };

      updateData.preferences = {
        notifications: {
          ...currentPreferences.notifications,
          ...validatedData.preferences.notifications,
        },
        privacy: {
          ...currentPreferences.privacy,
          ...validatedData.preferences.privacy,
        },
      };
    }

    // Update user profile
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning({
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
      });

    // Create audit log
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: "profile_update",
      resourceType: "user",
      resourceId: session.user.id,
      oldValues: {
        fullName: currentUser[0].fullName,
        phoneNumber: currentUser[0].phoneNumber,
        dateOfBirth: currentUser[0].dateOfBirth,
        gender: currentUser[0].gender,
        emergencyContact: currentUser[0].emergencyContact,
        medicalHistory: currentUser[0].medicalHistory,
        preferences: currentUser[0].preferences,
      },
      newValues: updateData,
      ipAddress:
        request.ip || request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
