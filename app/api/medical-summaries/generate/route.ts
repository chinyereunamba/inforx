export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { TextExtractor } from "@/lib/utils/text-extraction";
import { aiMedicalSummaryService } from "@/lib/services/ai-medical-summary";
import { MedicalRecord } from "@/lib/types/medical-records";

// POST /api/medical-summaries/generate - Generate AI medical summary
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
    const body = await request.json();
    const { recordIds, forceRegenerate = false } = body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json(
        { error: "Record IDs are required" },
        { status: 400 }
      );
    }

    // Check if user already has a recent summary (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existingSummary } = await supabase
        .from("medical_summaries")
        .select("*")
        .eq("user_id", user.id)
        .order("last_updated", { ascending: false })
        .limit(1)
        .single();

      if (existingSummary) {
        const lastUpdated = new Date(existingSummary.last_updated);
        const hoursSinceUpdate =
          (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 24) {
          return NextResponse.json({
            summary: existingSummary,
            message: "Using existing summary (less than 24 hours old)",
            fromCache: true,
          });
        }
      }
    }

    // Fetch the specified medical records
    const { data: records, error: recordsError } = await supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
      .in("id", recordIds)
      .order("visit_date", { ascending: false });

    if (recordsError) {
      console.error("Error fetching records:", recordsError);
      return NextResponse.json(
        { error: "Failed to fetch medical records" },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "No medical records found" },
        { status: 404 }
      );
    }

    const startTime = Date.now();
    const extractedTexts: string[] = [];
    const recordMetadata: Array<{
      title: string;
      type: string;
      hospital: string;
      visitDate: string;
      notes?: string;
    }> = [];

    // Process each record with files
    for (const record of records as MedicalRecord[]) {
      recordMetadata.push({
        title: record.title,
        type: record.type,
        hospital: record.hospital_name,
        visitDate: record.visit_date,
        notes: record.notes || undefined,
      });

      // If record has a file, extract text from it
      if (record.file_url && record.file_name) {
        try {
          // Download the file
          const fileResponse = await fetch(record.file_url);
          if (!fileResponse.ok) {
            console.warn(`Failed to download file: ${record.file_name}`);
            continue;
          }

          const fileBlob = await fileResponse.blob();
          const file = new File([fileBlob], record.file_name, {
            type: record.file_type || "application/octet-stream",
          });

          // Extract text from file
          const extractionResult = await TextExtractor.extractText(file);
          extractedTexts.push(extractionResult.text);
        } catch (error) {
          console.error(
            `Error extracting text from ${record.file_name}:`,
            error
          );
          // Continue with other files
        }
      } else {
        // If no file, use notes or title as text
        const textContent = record.notes || record.title;
        if (textContent) {
          extractedTexts.push(textContent);
        }
      }
    }

    // Generate AI summary
    const aiAnalysis = await aiMedicalSummaryService.generateSummary(
      extractedTexts,
      recordMetadata
    );

    // Save summary to database
    const { data: summary, error: summaryError } = await supabase
      .from("medical_summaries")
      .insert({
        user_id: user.id,
        summary_text: aiAnalysis.summary,
        conditions_identified: aiAnalysis.conditions,
        medications_mentioned: aiAnalysis.medications,
        tests_performed: aiAnalysis.tests,
        patterns_identified: aiAnalysis.patterns,
        risk_factors: aiAnalysis.riskFactors,
        recommendations: aiAnalysis.recommendations,
        record_count: records.length,
      })
      .select()
      .single();

    if (summaryError) {
      console.error("Error saving summary:", summaryError);
      return NextResponse.json(
        { error: "Failed to save medical summary" },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      summary,
      processingTime,
      recordsProcessed: records.length,
      filesProcessed: extractedTexts.length,
      message: "Medical summary generated successfully",
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate medical summary" },
      { status: 500 }
    );
  }
}
