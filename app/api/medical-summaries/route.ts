import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/medical-summaries - Get user's medical summaries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch user's medical summaries
    const { data: summaries, error } = await supabase
      .from("medical_summaries")
      .select("*")
      .eq("user_id", user.id)
      .order("last_updated", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching medical summaries:", error);
      return NextResponse.json(
        { error: "Failed to fetch medical summaries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summaries: summaries || [] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/medical-summaries - Delete all user's summaries
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all user's summaries
    const { error } = await supabase
      .from("medical_summaries")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting medical summaries:", error);
      return NextResponse.json(
        { error: "Failed to delete medical summaries" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "All medical summaries deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
