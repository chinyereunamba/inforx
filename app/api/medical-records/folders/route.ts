import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  medicalRecordFolders,
  medicalRecordFolderItems,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Medical Record Folders API
 * GET /api/medical-records/folders - List all folders
 * POST /api/medical-records/folders - Create new folder
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

    // Get all folders for the user
    const folders = await db
      .select()
      .from(medicalRecordFolders)
      .where(eq(medicalRecordFolders.userId, user.id))
      .orderBy(medicalRecordFolders.createdAt);

    // Get folder items for each folder
    const foldersWithItems = await Promise.all(
      folders.map(async (folder) => {
        const items = await db
          .select()
          .from(medicalRecordFolderItems)
          .where(eq(medicalRecordFolderItems.folderId, folder.id));

        return {
          ...folder,
          recordIds: items.map((item) => item.recordId),
        };
      })
    );

    return NextResponse.json({
      folders: foldersWithItems,
    });
  } catch (error) {
    console.error("Folders fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, description, color } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Create new folder
    const [newFolder] = await db
      .insert(medicalRecordFolders)
      .values({
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "blue",
      })
      .returning();

    return NextResponse.json({
      folder: {
        ...newFolder,
        recordIds: [],
      },
    });
  } catch (error) {
    console.error("Folder creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
