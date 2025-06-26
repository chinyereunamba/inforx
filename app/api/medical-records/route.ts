export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Parse request body
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const hospital_name = formData.get("hospital_name") as string;
    const visit_date = formData.get("visit_date") as string;
    const notes = formData.get("notes") as string;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!title?.trim() || !type || !hospital_name?.trim() || !visit_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    // Handle file upload if provided
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF, DOCX, PNG, JPG are allowed" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 10MB" },
          { status: 400 }
        );
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileNameWithTimestamp = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `medical-records/${user.id}/${fileNameWithTimestamp}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("medical-files")
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
    }

    // Create medical record in database
    const { data: record, error: dbError } = await supabase
      .from("medical_records")
      .insert({
        user_id: user.id,
        title: title.trim(),
        type,
        hospital_name: hospital_name.trim(),
        visit_date,
        notes: notes?.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
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
