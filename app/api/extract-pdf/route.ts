import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Enhanced API Route for Document Text Extraction
 * Supports PDF, DOCX, and other document formats
 * POST /api/extract-pdf
 */
export async function POST(request: NextRequest) {
  // Prevent this route from being processed during build time
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return NextResponse.json(
      { success: false, error: "API not available during build" },
      { status: 503 }
    );
  }

  try {
    // Get form data with file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    let extractedText = "";
    let pageCount = 1;
    let confidence = 95;
    let method = "unknown";

    // Handle different file types
    if (file.type.includes("pdf")) {
      // PDF extraction
      try {
        const pdf = require("pdf-parse");
        const result = await pdf(fileBuffer);
        extractedText = result.text;
        pageCount = result.numpages;
        method = "pdf-parse";
        confidence = 95;
      } catch (error) {
        throw new Error(
          `PDF extraction failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else if (
      file.type.includes("document") ||
      file.type.includes("word") ||
      file.name.endsWith(".docx")
    ) {
      // DOCX extraction
      try {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
        method = "mammoth";
        confidence = 98;
      } catch (error) {
        throw new Error(
          `DOCX extraction failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else if (file.type === "text/plain") {
      // Plain text
      extractedText = fileBuffer.toString("utf-8");
      method = "plain-text";
      confidence = 100;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Supported types: PDF, DOCX, TXT",
        },
        { status: 400 }
      );
    }

    // Clean and preprocess the extracted text
    const cleanedText = cleanExtractedText(extractedText);

    // Analyze the text for medical content
    const medicalAnalysis = analyzeMedicalContent(cleanedText);

    // Calculate word count
    const wordCount = cleanedText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Return extracted text with metadata
    return NextResponse.json({
      success: true,
      text: cleanedText,
      confidence,
      method,
      pageCount,
      wordCount,
      medicalAnalysis,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processingTime: Date.now(),
      },
    });
  } catch (error) {
    console.error("Document extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown document extraction error",
      },
      { status: 500 }
    );
  }
}

/**
 * Clean and preprocess extracted text
 */
function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove common OCR artifacts
      .replace(/[|]/g, "I") // Common OCR mistake
      // Fix common medical abbreviations
      .replace(/\bmg\b/gi, "mg")
      .replace(/\bml\b/gi, "ml")
      .replace(/\bmcg\b/gi, "mcg")
      // Remove leading/trailing whitespace
      .trim()
  );
}

/**
 * Analyze text for medical content
 */
function analyzeMedicalContent(text: string): {
  hasMedicalTerms: boolean;
  confidence: number;
  detectedTerms: string[];
  suggestedType:
    | "prescription"
    | "lab_result"
    | "scan"
    | "consultation"
    | "other";
} {
  const medicalTerms = {
    prescription: [
      "prescription",
      "rx",
      "sig:",
      "take",
      "tablet",
      "capsule",
      "mg",
      "ml",
      "dose",
      "dosage",
      "frequency",
      "daily",
      "twice",
      "medication",
      "drug",
      "pharmacy",
      "refill",
      "generic",
      "brand",
    ],
    lab_result: [
      "laboratory",
      "lab",
      "test",
      "result",
      "specimen",
      "blood",
      "urine",
      "reference range",
      "normal",
      "abnormal",
      "high",
      "low",
      "glucose",
      "cholesterol",
      "hemoglobin",
      "platelet",
      "white blood cell",
      "red blood cell",
    ],
    scan: [
      "x-ray",
      "mri",
      "ct",
      "scan",
      "ultrasound",
      "imaging",
      "radiology",
      "radiologist",
      "contrast",
      "findings",
      "impression",
      "chest",
      "abdomen",
      "brain",
      "spine",
      "fracture",
      "mass",
      "lesion",
    ],
    consultation: [
      "consultation",
      "visit",
      "examination",
      "diagnosis",
      "symptoms",
      "patient",
      "doctor",
      "physician",
      "treatment",
      "follow-up",
      "assessment",
      "plan",
      "history",
      "physical exam",
    ],
  };

  const lowerText = text.toLowerCase();
  const detectedTerms: string[] = [];
  const typeScores: Record<string, number> = {
    prescription: 0,
    lab_result: 0,
    scan: 0,
    consultation: 0,
  };

  // Count occurrences of medical terms
  Object.entries(medicalTerms).forEach(([type, terms]) => {
    terms.forEach((term) => {
      const regex = new RegExp(
        `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      const matches = lowerText.match(regex);
      if (matches) {
        typeScores[type] += matches.length;
        detectedTerms.push(...matches);
      }
    });
  });

  // Determine the most likely type
  const maxScore = Math.max(...Object.values(typeScores));
  const suggestedType =
    (Object.entries(typeScores).find(
      ([_, score]) => score === maxScore
    )?.[0] as any) || "other";

  const totalTerms = detectedTerms.length;
  const hasMedicalTerms = totalTerms > 0;
  const confidence = Math.min(
    100,
    (totalTerms / text.split(/\s+/).length) * 100 * 10
  ); // Rough confidence calculation

  return {
    hasMedicalTerms,
    confidence: Math.round(confidence),
    detectedTerms: [...new Set(detectedTerms)], // Remove duplicates
    suggestedType: maxScore > 0 ? suggestedType : "other",
  };
}
