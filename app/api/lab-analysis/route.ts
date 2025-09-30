import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LabResultAnalysisService } from "@/lib/services/lab-result-analysis";
import { db } from "@/lib/db";
import { medicalRecords, medicalSummaries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const LabAnalysisRequestSchema = z.object({
  recordId: z.string().uuid().optional(),
  labResults: z
    .array(
      z.object({
        testName: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        referenceRange: z.string().optional(),
        isAbnormal: z.boolean(),
        severity: z.enum(["normal", "mild", "moderate", "severe"]).optional(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  patientGender: z.enum(["male", "female"]).optional(),
  previousResults: z
    .array(
      z.object({
        date: z.string(),
        results: z.array(
          z.object({
            testName: z.string(),
            value: z.string(),
            unit: z.string().optional(),
            referenceRange: z.string().optional(),
            isAbnormal: z.boolean(),
          })
        ),
      })
    )
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
    const { recordId, labResults, patientGender, previousResults } =
      LabAnalysisRequestSchema.parse(body);

    let resultsToAnalyze = labResults;

    // If recordId is provided, get lab results from the medical record
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

      // Get existing AI analysis for lab results
      const [summary] = await db
        .select()
        .from(medicalSummaries)
        .where(eq(medicalSummaries.recordId, recordId))
        .limit(1);

      if (summary && summary.extractedData) {
        const extractedData = summary.extractedData as any;
        if (extractedData.labResults && extractedData.labResults.length > 0) {
          resultsToAnalyze = extractedData.labResults;
        } else {
          return NextResponse.json(
            { error: "No lab results found in the medical record analysis" },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error:
              "Medical record has not been analyzed yet. Please run AI analysis first.",
          },
          { status: 400 }
        );
      }
    }

    if (!resultsToAnalyze || resultsToAnalyze.length === 0) {
      return NextResponse.json(
        { error: "No lab results provided for analysis" },
        { status: 400 }
      );
    }

    // Perform lab result analysis
    const analysis = LabResultAnalysisService.analyzeLabResults(
      resultsToAnalyze,
      patientGender,
      previousResults
    );

    // Generate additional insights
    const insights = {
      totalTests: analysis.results.length,
      abnormalCount: analysis.abnormalResults.length,
      criticalCount: analysis.criticalResults.length,
      categoriesAffected: [
        ...new Set(analysis.abnormalResults.map((r) => r.category)),
      ],
      riskLevel: analysis.overallAssessment.urgencyLevel,
      hasImprovement: analysis.trendAnalysis.some(
        (t) => t.trend === "improving"
      ),
      hasDeterioration: analysis.trendAnalysis.some(
        (t) => t.trend === "worsening"
      ),
    };

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        patientGender: patientGender || "not_specified",
        recordId: recordId || null,
        hasTrendData: (previousResults?.length || 0) > 0,
      },
    });
  } catch (error) {
    console.error("[LAB_ANALYSIS_ERROR]", error);

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
    const patientGender = searchParams.get("patientGender") as
      | "male"
      | "female"
      | null;

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

    // Check if it's a lab result type record
    if (record.type !== "lab_result") {
      return NextResponse.json(
        { error: "Record is not a lab result type" },
        { status: 400 }
      );
    }

    // Get existing AI analysis
    const [summary] = await db
      .select()
      .from(medicalSummaries)
      .where(eq(medicalSummaries.recordId, recordId))
      .limit(1);

    if (!summary || !summary.extractedData) {
      return NextResponse.json(
        { error: "No AI analysis found for this record" },
        { status: 404 }
      );
    }

    const extractedData = summary.extractedData as any;
    if (!extractedData.labResults || extractedData.labResults.length === 0) {
      return NextResponse.json(
        { error: "No lab results found in the analysis" },
        { status: 404 }
      );
    }

    // Get previous lab results for trend analysis (simplified - in practice would query database)
    const previousResults: Array<{ date: string; results: any[] }> = [];

    // Perform lab result analysis
    const analysis = LabResultAnalysisService.analyzeLabResults(
      extractedData.labResults,
      patientGender || undefined,
      previousResults
    );

    // Generate insights
    const insights = {
      totalTests: analysis.results.length,
      abnormalCount: analysis.abnormalResults.length,
      criticalCount: analysis.criticalResults.length,
      categoriesAffected: [
        ...new Set(analysis.abnormalResults.map((r) => r.category)),
      ],
      riskLevel: analysis.overallAssessment.urgencyLevel,
      hasImprovement: analysis.trendAnalysis.some(
        (t) => t.trend === "improving"
      ),
      hasDeterioration: analysis.trendAnalysis.some(
        (t) => t.trend === "worsening"
      ),
    };

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        patientGender: patientGender || "not_specified",
        recordId,
        hasTrendData: previousResults.length > 0,
      },
    });
  } catch (error) {
    console.error("[GET_LAB_ANALYSIS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
