import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medicalRecords, users } from "@/lib/db/schema";
import {
  eq,
  and,
  or,
  like,
  gte,
  lte,
  desc,
  asc,
  sql,
  ilike,
} from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Enhanced Medical Records Search API
 * GET /api/medical-records/search
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

    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const types = searchParams.getAll("type");
    const hospitals = searchParams.getAll("hospital");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const tags = searchParams.getAll("tag");
    const hasFiles = searchParams.get("has_files");
    const statuses = searchParams.getAll("status");
    const sortBy = searchParams.get("sort_by") || "date";
    const sortOrder = searchParams.get("sort_order") || "desc";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build base query
    let whereConditions = [eq(medicalRecords.userId, user.id)];

    // Add text search condition
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      whereConditions.push(
        or(
          ilike(medicalRecords.title, searchTerm),
          ilike(medicalRecords.hospitalName, searchTerm),
          ilike(medicalRecords.notes, searchTerm),
          ilike(medicalRecords.textContent, searchTerm)
        )
      );
    }

    // Add type filter
    if (types.length > 0) {
      whereConditions.push(
        or(...types.map((type) => eq(medicalRecords.type, type)))
      );
    }

    // Add hospital filter
    if (hospitals.length > 0) {
      whereConditions.push(
        or(
          ...hospitals.map((hospital) =>
            ilike(medicalRecords.hospitalName, `%${hospital}%`)
          )
        )
      );
    }

    // Add date range filter
    if (startDate) {
      whereConditions.push(gte(medicalRecords.visitDate, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(medicalRecords.visitDate, endDate));
    }

    // Add file filter
    if (hasFiles === "true") {
      whereConditions.push(sql`${medicalRecords.fileUrl} IS NOT NULL`);
    } else if (hasFiles === "false") {
      whereConditions.push(sql`${medicalRecords.fileUrl} IS NULL`);
    }

    // Add processing status filter
    if (statuses.length > 0) {
      whereConditions.push(
        or(
          ...statuses.map((status) =>
            eq(medicalRecords.processingStatus, status)
          )
        )
      );
    }

    // Determine sort column and order
    let orderByClause;
    const isDesc = sortOrder === "desc";

    switch (sortBy) {
      case "title":
        orderByClause = isDesc
          ? desc(medicalRecords.title)
          : asc(medicalRecords.title);
        break;
      case "hospital":
        orderByClause = isDesc
          ? desc(medicalRecords.hospitalName)
          : asc(medicalRecords.hospitalName);
        break;
      case "date":
      default:
        orderByClause = isDesc
          ? desc(medicalRecords.visitDate)
          : asc(medicalRecords.visitDate);
        break;
    }

    // Execute search query
    const records = await db
      .select()
      .from(medicalRecords)
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicalRecords)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Generate facets for filtering
    const facets = await generateSearchFacets(user.id, whereConditions);

    // Generate suggestions if query provided
    const suggestions = query
      ? await generateSearchSuggestions(query, user.id)
      : [];

    return NextResponse.json({
      records,
      total,
      facets,
      suggestions,
      pagination: {
        limit,
        offset,
        hasMore: offset + records.length < total,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate search facets for filtering
 */
async function generateSearchFacets(userId: string, baseConditions: any[]) {
  try {
    // Get type facets
    const typeFacets = await db
      .select({
        value: medicalRecords.type,
        count: sql<number>`count(*)`,
      })
      .from(medicalRecords)
      .where(and(...baseConditions))
      .groupBy(medicalRecords.type)
      .orderBy(desc(sql`count(*)`));

    // Get hospital facets
    const hospitalFacets = await db
      .select({
        value: medicalRecords.hospitalName,
        count: sql<number>`count(*)`,
      })
      .from(medicalRecords)
      .where(and(...baseConditions))
      .groupBy(medicalRecords.hospitalName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get year facets
    const yearFacets = await db
      .select({
        value: sql<number>`EXTRACT(YEAR FROM ${medicalRecords.visitDate})`,
        count: sql<number>`count(*)`,
      })
      .from(medicalRecords)
      .where(and(...baseConditions))
      .groupBy(sql`EXTRACT(YEAR FROM ${medicalRecords.visitDate})`)
      .orderBy(desc(sql`EXTRACT(YEAR FROM ${medicalRecords.visitDate})`));

    return {
      types: typeFacets,
      hospitals: hospitalFacets,
      tags: [], // TODO: Implement tags when added to schema
      years: yearFacets,
    };
  } catch (error) {
    console.error("Facets generation error:", error);
    return {
      types: [],
      hospitals: [],
      tags: [],
      years: [],
    };
  }
}

/**
 * Generate search suggestions
 */
async function generateSearchSuggestions(
  query: string,
  userId: string
): Promise<string[]> {
  try {
    const searchTerm = `%${query.trim()}%`;

    // Get suggestions from titles and hospital names
    const titleSuggestions = await db
      .select({ title: medicalRecords.title })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.userId, userId),
          ilike(medicalRecords.title, searchTerm)
        )
      )
      .limit(5);

    const hospitalSuggestions = await db
      .select({ hospital: medicalRecords.hospitalName })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.userId, userId),
          ilike(medicalRecords.hospitalName, searchTerm)
        )
      )
      .groupBy(medicalRecords.hospitalName)
      .limit(3);

    const suggestions = [
      ...titleSuggestions.map((r) => r.title),
      ...hospitalSuggestions.map((r) => r.hospital),
    ];

    // Remove duplicates and filter out exact matches
    return [...new Set(suggestions)]
      .filter((s) => s.toLowerCase() !== query.toLowerCase())
      .slice(0, 8);
  } catch (error) {
    console.error("Suggestions generation error:", error);
    return [];
  }
}
