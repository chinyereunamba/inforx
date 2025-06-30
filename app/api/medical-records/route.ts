export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TextExtractor } from "@/lib/utils/text-extraction.client";
import { aiMedicalSummaryService } from "@/lib/services/ai-medical-summary";
import { medicalRecordsService } from "@/lib/services/medical-records";

// GET /api/medical-records - Fetch user's medical records
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const hospital = searchParams.get("hospital");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (hospital && hospital !== "all") {
      query = query.eq("hospital_name", hospital);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,hospital_name.ilike.%${search}%`
      );
    }

    const { data: records, error } = await query;

    if (error) {
      console.error("Error fetching medical records:", error);
      return NextResponse.json(
        { error: "Failed to fetch medical records" },
        { status: 500 }
      );
    }

    return NextResponse.json({ records: records || [] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/medical-records - Create new medical record
export async function POST(request: NextRequest) {
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

    // Parse JSON body
    const body = await request.json();
    const {
      title,
      type,
      hospital_name,
      visit_date,
      notes,
      file_url,
      file_name,
      file_size,
      file_type,
    } = body;

    // Validate required fields
    if (!title?.trim() || !type || !hospital_name?.trim() || !visit_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create medical record in database
    let { data: record, error: dbError } = await supabase
      .from("medical_records")
      .insert({
        user_id: user.id,
        title: title.trim(),
        type,
        hospital_name: hospital_name.trim(),
        visit_date,
        notes: notes?.trim() || null,
        file_url: file_url || null,
        file_name: file_name || null,
        file_size: file_size || null,
        file_type: file_type || null,
        text_content: null,
        processing_status: file_url ? "processing" : "complete",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create medical record" },
        { status: 500 }
      );
    }

    // No file to extract text from, so skip extraction

    return NextResponse.json(
      {
        record,
        message: "Medical record created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
