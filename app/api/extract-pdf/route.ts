import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const dynamic = 'force-dynamic';

/**
 * API Route for PDF Text Extraction
 * POST /api/extract-pdf
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data with PDF file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Verify file is a PDF
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, error: "File must be a PDF" },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Use pdf-parse to extract text
    const result = await pdf(Buffer.from(buffer));

    // Return extracted text
    return NextResponse.json({
      success: true,
      text: result.text,
      info: {
        pages: result.numpages,
        fileName: file.name
      }
    });
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error 
          ? `PDF extraction failed: ${error.message}` 
          : "Unknown PDF extraction error" 
      },
      { status: 500 }
    );
  }
}