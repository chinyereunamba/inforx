import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { LoggingService } from "@/lib/services/logging-service";

export const dynamic = "force-dynamic";

/**
 * Search Analytics API
 * POST /api/medical-records/search-analytics
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { query, filters, resultCount, timestamp } = body;

    // Log search analytics
    await LoggingService.logAction(user, "search_query", {
      query,
      filters,
      result_count: resultCount,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
