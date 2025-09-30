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
 * Individual Medical Record Folder API
 * GET /api/medical-records/folders/[id] - Get folder details
 * PUT /api/medical-records/folders/[id] - Update folder
 * DELETE /api/medical-records/folders/[id] - Delete folder
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const folderId = params.id;

    // Get folder
    const [folder] = await db
      .select()
      .from(medicalRecordFolders)
      .where(
        and(
          eq(medicalRecordFolders.id, folderId),
          eq(medicalRecordFolders.userId, user.id)
        )
      );

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Get folder items
    const items = await db
      .select()
      .from(medicalRecordFolderItems)
      .where(eq(medicalRecordFolderItems.folderId, folderId));

    return NextResponse.json({
      folder: {
        ...folder,
        recordIds: items.map((item) => item.recordId),
      },
    });
  } catch (error) {
    console.error("Folder fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const folderId = params.id;

    // Parse request body
    const body = await request.json();
    const { name, description, color } = body;

    // Validate folder exists and belongs to user
    const [existingFolder] = await db
      .select()
      .from(medicalRecordFolders)
      .where(
        and(
          eq(medicalRecordFolders.id, folderId),
          eq(medicalRecordFolders.userId, user.id)
        )
      );

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Update folder
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color;

    const [updatedFolder] = await db
      .update(medicalRecordFolders)
      .set(updateData)
      .where(eq(medicalRecordFolders.id, folderId))
      .returning();

    // Get folder items
    const items = await db
      .select()
      .from(medicalRecordFolderItems)
      .where(eq(medicalRecordFolderItems.folderId, folderId));

    return NextResponse.json({
      folder: {
        ...updatedFolder,
        recordIds: items.map((item) => item.recordId),
      },
    });
  } catch (error) {
    console.error("Folder update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const folderId = params.id;

    // Validate folder exists and belongs to user
    const [existingFolder] = await db
      .select()
      .from(medicalRecordFolders)
      .where(
        and(
          eq(medicalRecordFolders.id, folderId),
          eq(medicalRecordFolders.userId, user.id)
        )
      );

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Delete folder (cascade will handle folder items)
    await db
      .delete(medicalRecordFolders)
      .where(eq(medicalRecordFolders.id, folderId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Folder deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
