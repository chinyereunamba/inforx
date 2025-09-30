import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MedicalScanAnalysisService } from "@/lib/services/medical-scan-analysis";
import { db } from "@/lib/db";
import { medicalRecords, medicalSummaries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ScanAnalysisRequestSchema = z.object({
  recordId: z.string().uuid().optional(),
  scanText: z.string().optional(),
  scanType: z
    .enum(["x-ray", "ct_scan", "mri", "ultrasound", "mammogram", "bone_scan"])
    .optional(),
  anatomicalRegion: z
    .enum(["chest", "abdomen", "pelvis", "head", "spine", "extremities"])
    .optional(),
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
    const { recordId, scanText, scanType, anatomicalRegion } =
      ScanAnalysisRequestSchema.parse(body);

    let textToAnalyze = scanText;
    let detectedScanType = scanType;
    let detectedRegion = anatomicalRegion;

    // If recordId is provided, get scan text from the medical record
    if (recordId) {
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

      // Check if it's a scan type record
      if (record.type !== "scan") {
        return NextResponse.json(
          { error: "Record is not a scan type" },
          { status: 400 }
        );
      }

      // Use the text content from the record
      if (!record.textContent || record.textContent.trim().length === 0) {
        return NextResponse.json(
          {
            error:
              "No text content available in the medical record for analysis",
          },
          { status: 400 }
        );
      }

      textToAnalyze = record.textContent;
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return NextResponse.json(
        { error: "No scan text provided for analysis" },
        { status: 400 }
      );
    }

    // Perform scan analysis
    const analysis = MedicalScanAnalysisService.analyzeScanReport(
      textToAnalyze,
      detectedScanType,
      detectedRegion
    );

    // Generate additional insights
    const insights = {
      totalFindings: analysis.findings.length,
      abnormalFindings: analysis.findings.filter((f) => f.severity !== "normal")
        .length,
      urgentFindings: analysis.findings.filter((f) => f.isUrgent).length,
      requiresFollowUp: analysis.findings.some((f) => f.requiresFollowUp),
      specialistReferralsNeeded: analysis.specialistReferrals.length,
      overallSeverity: analysis.overallAssessment.severity,
      urgencyLevel: analysis.overallAssessment.urgencyLevel,
      keyCategories: [...new Set(analysis.findings.map((f) => f.category))],
    };

    // Store analysis if recordId is provided
    if (recordId) {
      try {
        // Check if analysis already exists
        const [existingSummary] = await db
          .select()
          .from(medicalSummaries)
          .where(eq(medicalSummaries.recordId, recordId))
          .limit(1);

        const scanAnalysisData = {
          scanAnalysis: analysis,
          analyzedAt: new Date().toISOString(),
          insights,
        };

        if (existingSummary) {
          // Update existing summary with scan analysis
          await db
            .update(medicalSummaries)
            .set({
              extractedData: {
                ...(existingSummary.extractedData as any),
                scanAnalysis: scanAnalysisData,
              },
              updatedAt: new Date(),
            })
            .where(eq(medicalSummaries.id, existingSummary.id));
        } else {
          // Create new summary with scan analysis
          await db.insert(medicalSummaries).values({
            recordId: recordId,
            userId: session.user.id,
            summary: analysis.overallAssessment.impression,
            extractedData: {
              scanAnalysis: scanAnalysisData,
              medications: [],
              labResults: [],
              diagnoses: analysis.overallAssessment.keyFindings,
              recommendations: analysis.recommendations.map(
                (r) => r.description
              ),
            },
            riskFactors: analysis.findings
              .filter(
                (f) => f.severity === "severe" || f.severity === "critical"
              )
              .map((f) => ({
                factor: f.description,
                severity:
                  f.severity === "critical"
                    ? ("high" as const)
                    : ("medium" as const),
                description: f.clinicalSignificance,
              })),
            urgencyLevel:
              analysis.overallAssessment.urgencyLevel === "emergency"
                ? "critical"
                : analysis.overallAssessment.urgencyLevel === "urgent"
                ? "high"
                : analysis.overallAssessment.urgencyLevel === "semi_urgent"
                ? "medium"
                : "low",
            confidence: "0.85", // Default confidence for scan analysis
            aiModel: "scan-analysis-v1",
            processedAt: new Date(),
          });
        }

        // Update record processing status
        await db
          .update(medicalRecords)
          .set({
            processingStatus: "completed",
            updatedAt: new Date(),
          })
          .where(eq(medicalRecords.id, recordId));
      } catch (dbError) {
        console.error("[SCAN_ANALYSIS_DB_ERROR]", dbError);
        // Continue with response even if DB storage fails
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        scanType: analysis.scanType,
        anatomicalRegion: analysis.anatomicalRegion,
        recordId: recordId || null,
        textLength: textToAnalyze.length,
      },
    });
  } catch (error) {
    console.error("[SCAN_ANALYSIS_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
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

    // Check if it's a scan type record
    if (record.type !== "scan") {
      return NextResponse.json(
        { error: "Record is not a scan type" },
        { status: 400 }
      );
    }

    // Get existing analysis
    const [summary] = await db
      .select()
      .from(medicalSummaries)
      .where(eq(medicalSummaries.recordId, recordId))
      .limit(1);

    if (!summary || !summary.extractedData) {
      return NextResponse.json(
        { error: "No scan analysis found for this record" },
        { status: 404 }
      );
    }

    const extractedData = summary.extractedData as any;
    if (!extractedData.scanAnalysis) {
      return NextResponse.json(
        { error: "No scan analysis data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: extractedData.scanAnalysis.scanAnalysis,
      insights: extractedData.scanAnalysis.insights,
      metadata: {
        analyzedAt: extractedData.scanAnalysis.analyzedAt,
        scanType: extractedData.scanAnalysis.scanAnalysis.scanType,
        anatomicalRegion:
          extractedData.scanAnalysis.scanAnalysis.anatomicalRegion,
        recordId,
      },
    });
  } catch (error) {
    console.error("[GET_SCAN_ANALYSIS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
