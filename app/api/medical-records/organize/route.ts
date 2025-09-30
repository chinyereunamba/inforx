import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  medicalRecords,
  medicalRecordFolders,
  medicalRecordFolderItems,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Medical Records Organization API
 * POST /api/medical-records/organize - Move records to folders
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
    const { recordIds, targetFolderId, action = "move" } = body;

    // Validate input
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json(
        { error: "Record IDs are required" },
        { status: 400 }
      );
    }

    // Validate records belong to user
    const records = await db
      .select({ id: medicalRecords.id })
      .from(medicalRecords)
      .where(
        and(
          inArray(medicalRecords.id, recordIds),
          eq(medicalRecords.userId, user.id)
        )
      );

    if (records.length !== recordIds.length) {
      return NextResponse.json(
        { error: "Some records not found or unauthorized" },
        { status: 404 }
      );
    }

    // If targetFolderId is provided, validate folder belongs to user
    if (targetFolderId) {
      const [folder] = await db
        .select({ id: medicalRecordFolders.id })
        .from(medicalRecordFolders)
        .where(
          and(
            eq(medicalRecordFolders.id, targetFolderId),
            eq(medicalRecordFolders.userId, user.id)
          )
        );

      if (!folder) {
        return NextResponse.json(
          { error: "Target folder not found" },
          { status: 404 }
        );
      }
    }

    // Remove records from all folders first (for move operation)
    if (action === "move") {
      await db
        .delete(medicalRecordFolderItems)
        .where(inArray(medicalRecordFolderItems.recordId, recordIds));
    }

    // Add records to target folder if specified
    if (targetFolderId) {
      const folderItems = recordIds.map((recordId) => ({
        folderId: targetFolderId,
        recordId,
      }));

      await db
        .insert(medicalRecordFolderItems)
        .values(folderItems)
        .onConflictDoNothing(); // In case of copy operation with existing items
    }

    return NextResponse.json({
      success: true,
      message: `${recordIds.length} record(s) ${
        action === "move" ? "moved" : "copied"
      } successfully`,
    });
  } catch (error) {
    console.error("Organization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
