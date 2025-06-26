export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LatestSummaryResponse } from "@/lib/types/medical-summaries";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest
): Promise<NextResponse<LatestSummaryResponse>> {
  try {
    // Get the user from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication",
        },
        { status: 401 }
      );
    }

    // Fetch the most recent medical summary for the user
    const { data: summary, error: summaryError } = await supabase
      .from("medical_summaries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (summaryError) {
      if (summaryError.code === "PGRST116") {
        // No summary found
        return NextResponse.json(
          {
            success: false,
            error: "No medical summary found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch summary: ${summaryError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching latest medical summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
