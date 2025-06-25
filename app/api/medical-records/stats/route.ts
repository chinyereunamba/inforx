import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { MedicalRecord } from "@/lib/types/medical-records";

// GET /api/medical-records/stats - Get medical records statistics
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

    // Get all user's records for statistics
    const { data: records, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching records for stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch medical records" },
        { status: 500 }
      );
    }

    const recordsList = (records || []) as MedicalRecord[];

    // Calculate statistics
    const stats = {
      totalRecords: recordsList.length,
      recordsByType: {} as Record<string, number>,
      recordsByHospital: {} as Record<string, number>,
      totalFileSize: 0,
      recordsByMonth: {} as Record<string, number>,
      recentRecords: recordsList.slice(0, 5), // Last 5 records
    };

    // Process each record
    recordsList.forEach((record: MedicalRecord) => {
      // Count by type
      stats.recordsByType[record.type] =
        (stats.recordsByType[record.type] || 0) + 1;

      // Count by hospital
      stats.recordsByHospital[record.hospital_name] =
        (stats.recordsByHospital[record.hospital_name] || 0) + 1;

      // Sum file sizes
      if (record.file_size) {
        stats.totalFileSize += record.file_size;
      }

      // Count by month (created_at)
      if (record.created_at) {
        const date = new Date(record.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        stats.recordsByMonth[monthKey] =
          (stats.recordsByMonth[monthKey] || 0) + 1;
      }
    });

    // Get top hospitals (sorted by count)
    const topHospitals = Object.entries(stats.recordsByHospital)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hospital, count]) => ({ hospital, count }));

    // Get top record types (sorted by count)
    const topTypes = Object.entries(stats.recordsByType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    // Format file size
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const response = {
      ...stats,
      topHospitals,
      topTypes,
      formattedTotalFileSize: formatFileSize(stats.totalFileSize),
      averageFileSize:
        recordsList.length > 0
          ? formatFileSize(stats.totalFileSize / recordsList.length)
          : "0 Bytes",
      recordsWithFiles: recordsList.filter((r: MedicalRecord) => r.file_url)
        .length,
      recordsWithoutFiles: recordsList.filter((r: MedicalRecord) => !r.file_url)
        .length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
