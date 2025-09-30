import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({
      message: "You must type 'DELETE' to confirm account deletion",
    }),
  }),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmation } = deleteAccountSchema.parse(body);

    // Get current user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password (if user has one - OAuth users might not)
    if (user[0].passwordHash) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user[0].passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 400 }
        );
      }
    }

    // Create final audit log before deletion
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: "account_deletion",
      resourceType: "user",
      resourceId: session.user.id,
      oldValues: {
        email: user[0].email,
        fullName: user[0].fullName,
        deletedAt: new Date().toISOString(),
      },
      ipAddress:
        request.ip || request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // Delete user account (cascade will handle related records)
    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

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
