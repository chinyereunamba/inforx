import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Popular Search Terms API
 * GET /api/medical-records/popular-searches
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return static popular medical terms
    // In a full implementation, this would come from search analytics
    const popularTerms = [
      "prescription",
      "blood test",
      "x-ray",
      "consultation",
      "lab results",
      "medication",
      "diagnosis",
      "treatment",
      "follow-up",
      "scan",
    ];

    return NextResponse.json({
      terms: popularTerms,
    });
  } catch (error) {
    console.error("Popular searches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
