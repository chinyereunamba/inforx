import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = verifyEmailSchema.parse(body);

    // Find user with matching email and token
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.emailVerificationToken, token),
          eq(users.isEmailVerified, false)
        )
      )
      .limit(1);

    if (!user[0]) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user[0].id));

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      );
    }

    const { token: validatedToken, email: validatedEmail } =
      verifyEmailSchema.parse({ token, email });

    // Find user with matching email and token
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, validatedEmail),
          eq(users.emailVerificationToken, validatedToken),
          eq(users.isEmailVerified, false)
        )
      )
      .limit(1);

    if (!user[0]) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user[0].id));

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/auth/signin?verified=true", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=verification_failed", request.url)
    );
  }
}
