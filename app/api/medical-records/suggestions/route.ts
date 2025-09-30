import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medicalRecords } from "@/lib/db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Search Suggestions API
 * GET /api/medical-records/suggestions
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

    // Parse query parameter
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Get suggestions from various fields
    const [titleSuggestions, hospitalSuggestions, contentSuggestions] =
      await Promise.all([
        // Title suggestions
        db
          .select({
            text: medicalRecords.title,
            type: sql<string>`'title'`,
            count: sql<number>`1`,
          })
          .from(medicalRecords)
          .where(
            and(
              eq(medicalRecords.userId, user.id),
              ilike(medicalRecords.title, searchTerm)
            )
          )
          .limit(5),

        // Hospital suggestions
        db
          .select({
            text: medicalRecords.hospitalName,
            type: sql<string>`'hospital'`,
            count: sql<number>`count(*)`,
          })
          .from(medicalRecords)
          .where(
            and(
              eq(medicalRecords.userId, user.id),
              ilike(medicalRecords.hospitalName, searchTerm)
            )
          )
          .groupBy(medicalRecords.hospitalName)
          .limit(3),

        // Content suggestions (extract relevant phrases)
        db
          .select({
            text: medicalRecords.textContent,
            title: medicalRecords.title,
          })
          .from(medicalRecords)
          .where(
            and(
              eq(medicalRecords.userId, user.id),
              ilike(medicalRecords.textContent, searchTerm),
              sql`${medicalRecords.textContent} IS NOT NULL`
            )
          )
          .limit(3),
      ]);

    // Process content suggestions to extract relevant phrases
    const processedContentSuggestions = contentSuggestions
      .map((item) => {
        if (!item.text) return null;

        // Find sentences containing the query
        const sentences = item.text.split(/[.!?]+/);
        const relevantSentence = sentences.find((sentence) =>
          sentence.toLowerCase().includes(query.toLowerCase())
        );

        if (relevantSentence) {
          // Extract a phrase around the query term
          const words = relevantSentence.trim().split(/\s+/);
          const queryIndex = words.findIndex((word) =>
            word.toLowerCase().includes(query.toLowerCase())
          );

          if (queryIndex !== -1) {
            const start = Math.max(0, queryIndex - 2);
            const end = Math.min(words.length, queryIndex + 3);
            const phrase = words.slice(start, end).join(" ");

            return {
              text: phrase,
              type: "content",
              source: item.title,
              count: 1,
            };
          }
        }

        return null;
      })
      .filter(Boolean);

    // Combine all suggestions
    const allSuggestions = [
      ...titleSuggestions.map((s) => ({ ...s, type: "title" })),
      ...hospitalSuggestions.map((s) => ({ ...s, type: "hospital" })),
      ...processedContentSuggestions,
    ];

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = allSuggestions
      .filter(
        (suggestion, index, self) =>
          index ===
          self.findIndex(
            (s) => s.text.toLowerCase() === suggestion.text.toLowerCase()
          )
      )
      .filter((s) => s.text.toLowerCase() !== query.toLowerCase())
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStartsWithQuery = a.text
          .toLowerCase()
          .startsWith(query.toLowerCase());
        const bStartsWithQuery = b.text
          .toLowerCase()
          .startsWith(query.toLowerCase());

        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;

        // Then sort by type priority (title > hospital > content)
        const typePriority = { title: 3, hospital: 2, content: 1 };
        return (
          (typePriority[b.type as keyof typeof typePriority] || 0) -
          (typePriority[a.type as keyof typeof typePriority] || 0)
        );
      })
      .slice(0, 8);

    return NextResponse.json({
      suggestions: uniqueSuggestions.map((s) => s.text),
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
