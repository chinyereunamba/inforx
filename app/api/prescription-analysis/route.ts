import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrescriptionAnalysisService } from "@/lib/services/prescription-analysis";
import { db } from "@/lib/db";
import { medicalRecords, medicalSummaries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PrescriptionAnalysisRequestSchema = z.object({
  recordId: z.string().uuid().optional(),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string().optional(),
        instructions: z.string().optional(),
        sideEffects: z.array(z.string()).optional(),
        interactions: z.array(z.string()).optional(),
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
    const { recordId, medications } =
      PrescriptionAnalysisRequestSchema.parse(body);

    let medicationsToAnalyze = medications;

    // If recordId is provided, get medications from the medical record
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

      // Get existing AI analysis for medications
      const [summary] = await db
        .select()
        .from(medicalSummaries)
        .where(eq(medicalSummaries.recordId, recordId))
        .limit(1);

      if (summary && summary.extractedData) {
        const extractedData = summary.extractedData as any;
        if (extractedData.medications && extractedData.medications.length > 0) {
          medicationsToAnalyze = extractedData.medications;
        } else {
          return NextResponse.json(
            { error: "No medications found in the medical record analysis" },
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

    if (!medicationsToAnalyze || medicationsToAnalyze.length === 0) {
      return NextResponse.json(
        { error: "No medications provided for analysis" },
        { status: 400 }
      );
    }

    // Perform prescription analysis
    const analysis =
      PrescriptionAnalysisService.analyzePrescription(medicationsToAnalyze);

    // Generate additional insights
    const insights = {
      riskLevel:
        analysis.complexityScore > 70
          ? "high"
          : analysis.complexityScore > 40
          ? "medium"
          : "low",
      adherenceRisk: analysis.medicationSchedule.length > 3 ? "high" : "low",
      monitoringRequired: analysis.medications.some((med) => med.isHighRisk),
      criticalInteractions: analysis.drugInteractions.filter(
        (int) => int.severity === "severe"
      ).length,
    };

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        totalMedications: analysis.totalMedications,
        complexityScore: analysis.complexityScore,
        recordId: recordId || null,
      },
    });
  } catch (error) {
    console.error("[PRESCRIPTION_ANALYSIS_ERROR]", error);

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

    // Check if it's a prescription type record
    if (record.type !== "prescription") {
      return NextResponse.json(
        { error: "Record is not a prescription type" },
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
    if (!extractedData.medications || extractedData.medications.length === 0) {
      return NextResponse.json(
        { error: "No medications found in the analysis" },
        { status: 404 }
      );
    }

    // Perform prescription analysis
    const analysis = PrescriptionAnalysisService.analyzePrescription(
      extractedData.medications
    );

    // Generate insights
    const insights = {
      riskLevel:
        analysis.complexityScore > 70
          ? "high"
          : analysis.complexityScore > 40
          ? "medium"
          : "low",
      adherenceRisk: analysis.medicationSchedule.length > 3 ? "high" : "low",
      monitoringRequired: analysis.medications.some((med) => med.isHighRisk),
      criticalInteractions: analysis.drugInteractions.filter(
        (int) => int.severity === "severe"
      ).length,
    };

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      metadata: {
        analyzedAt: new Date().toISOString(),
        totalMedications: analysis.totalMedications,
        complexityScore: analysis.complexityScore,
        recordId,
      },
    });
  } catch (error) {
    console.error("[GET_PRESCRIPTION_ANALYSIS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
