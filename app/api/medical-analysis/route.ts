import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  medicalAIService,
  AIRateLimitError,
  AIServiceError,
} from "@/lib/services/ai-medical-interpretation";
import { db } from "@/lib/db";
import { medicalRecords, medicalSummaries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AnalysisRequestSchema = z.object({
  recordId: z.string().uuid(),
  forceReanalysis: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { recordId, forceReanalysis } = AnalysisRequestSchema.parse(body);

    // Get the medical record
    const [record] = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, recordId))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found" },
        { status: 404 }
      );
    }

    // Check if user owns the record
    if (record.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if record has text content
    if (!record.textContent || record.textContent.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content available for analysis" },
        { status: 400 }
      );
    }

    // Check if analysis already exists and force reanalysis is not requested
    if (!forceReanalysis) {
      const [existingSummary] = await db
        .select()
        .from(medicalSummaries)
        .where(eq(medicalSummaries.recordId, recordId))
        .limit(1);

      if (existingSummary) {
        return NextResponse.json({
          success: true,
          analysis: {
            id: existingSummary.id,
            summary: existingSummary.summary,
            extractedData: existingSummary.extractedData,
            riskFactors: existingSummary.riskFactors,
            urgencyLevel: existingSummary.urgencyLevel,
            confidence: existingSummary.confidence
              ? parseFloat(existingSummary.confidence)
              : 0.7,
            aiModel: existingSummary.aiModel,
            processedAt: existingSummary.processedAt,
          },
          isExisting: true,
        });
      }
    }

    // Update record processing status
    await db
      .update(medicalRecords)
      .set({
        processingStatus: "processing",
        processingError: null,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, recordId));

    try {
      // Perform AI analysis
      const analysis = await medicalAIService.analyzeMedicalDocument(
        session.user.id,
        record.type,
        record.textContent
      );

      // Save or update the analysis
      let summaryId: string;

      if (forceReanalysis) {
        // Delete existing summary if force reanalysis
        await db
          .delete(medicalSummaries)
          .where(eq(medicalSummaries.recordId, recordId));
      }

      // Insert new summary
      const [newSummary] = await db
        .insert(medicalSummaries)
        .values({
          recordId: recordId,
          userId: session.user.id,
          summary: analysis.summary,
          extractedData: analysis.extractedData,
          riskFactors: analysis.riskFactors,
          urgencyLevel: analysis.urgencyLevel,
          confidence: analysis.confidence.toString(),
          aiModel: analysis.aiModel,
          processedAt: new Date(),
        })
        .returning({ id: medicalSummaries.id });

      summaryId = newSummary.id;

      // Update record processing status to completed
      await db
        .update(medicalRecords)
        .set({
          processingStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(medicalRecords.id, recordId));

      // Check confidence threshold and add warning if needed
      const confidenceThreshold = medicalAIService.getConfidenceThreshold();
      const lowConfidence =
        analysis.confidence < confidenceThreshold.recommended;

      return NextResponse.json({
        success: true,
        analysis: {
          id: summaryId,
          summary: analysis.summary,
          extractedData: analysis.extractedData,
          riskFactors: analysis.riskFactors,
          urgencyLevel: analysis.urgencyLevel,
          confidence: analysis.confidence,
          aiModel: analysis.aiModel,
          processedAt: new Date(),
        },
        warnings: lowConfidence
          ? [
              {
                type: "low_confidence",
                message: `Analysis confidence is ${Math.round(
                  analysis.confidence * 100
                )}%. Consider manual review.`,
              },
            ]
          : [],
        isExisting: false,
      });
    } catch (analysisError) {
      // Update record processing status to failed
      const errorMessage =
        analysisError instanceof Error
          ? analysisError.message
          : "Unknown analysis error";

      await db
        .update(medicalRecords)
        .set({
          processingStatus: "failed",
          processingError: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(medicalRecords.id, recordId));

      throw analysisError;
    }
  } catch (error) {
    console.error("[MEDICAL_ANALYSIS_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    if (error instanceof AIRateLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          retryAfter: error.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": error.retryAfter.toString(),
          },
        }
      );
    }

    if (error instanceof AIServiceError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    // Get existing analysis
    const [summary] = await db
      .select()
      .from(medicalSummaries)
      .where(eq(medicalSummaries.recordId, recordId))
      .limit(1);

    if (!summary) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Check if user owns the analysis
    if (summary.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: summary.id,
        summary: summary.summary,
        extractedData: summary.extractedData,
        riskFactors: summary.riskFactors,
        urgencyLevel: summary.urgencyLevel,
        confidence: summary.confidence ? parseFloat(summary.confidence) : 0.7,
        aiModel: summary.aiModel,
        processedAt: summary.processedAt,
      },
    });
  } catch (error) {
    console.error("[GET_MEDICAL_ANALYSIS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
