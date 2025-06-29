export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/medical-records/[id] - Get specific medical record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Fetch the specific record
    // Include text_content in the record
    const { data: record, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Medical record not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching medical record:", error);
      return NextResponse.json(
        { error: "Failed to fetch medical record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/medical-records/[id] - Update medical record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Validate required fields
    const { title, type, hospital_name, visit_date, notes } = body;

    if (!title?.trim() || !type || !hospital_name?.trim() || !visit_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the record
    const { data: record, error } = await supabase
      .from("medical_records")
      .update({
        title: title.trim(),
        type,
        hospital_name: hospital_name.trim(),
        visit_date,
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Medical record not found" },
          { status: 404 }
        );
      }
      console.error("Error updating medical record:", error);
      return NextResponse.json(
        { error: "Failed to update medical record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      record,
      message: "Medical record updated successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/medical-records/[id] - Delete medical record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // First, get the record to check if it has a file
    const { data: record, error: fetchError } = await supabase
      .from("medical_records")
      .select("file_url, file_name")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Medical record not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching record for deletion:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch medical record" },
        { status: 500 }
      );
    }

    // Delete the record from database
    const { error: deleteError } = await supabase
      .from("medical_records")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting medical record:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete medical record" },
        { status: 500 }
      );
    }

    // If there was a file, delete it from storage
    if (record?.file_url) {
      try {
        // Extract file path from URL
        const urlParts = record.file_url.split("/");
        const filePath = urlParts.slice(-3).join("/"); // vault/userId/filename

        const { error: storageError } = await supabase.storage
          .from("vault")
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Don't fail the request if file deletion fails
        }
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Don't fail the request if file deletion fails
      }
    }
    return NextResponse.json({
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
