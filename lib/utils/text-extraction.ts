import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ExtractedText {
  text: string;
  fileName: string;
  success: boolean;
  error?: string;
}

export class TextExtractor {
  static async extractText(file: File): Promise<ExtractedText> {
    try {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      switch (fileExtension) {
        case "pdf":
          return await _extractTextFromPDF(file, fileName);
        case "txt":
          return await _extractTextFromText(file, fileName);
        case "docx":
          return await _extractTextFromDocx(file, fileName);
        default:
          return {
            text: `[File content for ${fileName} - format not supported for text extraction]`,
            fileName,
            success: true,
          };
      }
    } catch (error) {
      return {
        text: "",
        fileName: file.name,
        success: false,
        error: `Extraction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

export async function extractTextFromFile(
  fileUrl: string,
  fileName: string
): Promise<ExtractedText> {
  try {
    // Extract bucket and path from the file URL
    const urlParts = fileUrl.split("/");
    const bucketName = urlParts[3]; // Assuming URL format: https://.../storage/v1/object/public/bucket/path
    const filePath = urlParts.slice(4).join("/");

    // Download the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      return {
        text: "",
        fileName,
        success: false,
        error: `Failed to download file: ${error.message}`,
      };
    }

    if (!data) {
      return {
        text: "",
        fileName,
        success: false,
        error: "No data received from storage",
      };
    }

    // Handle different file types
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    switch (fileExtension) {
      case "pdf":
        return await _extractTextFromPDF(data, fileName);
      case "txt":
        return await _extractTextFromText(data, fileName);
      case "docx":
        return await _extractTextFromDocx(data, fileName);
      default:
        return {
          text: `[File content for ${fileName} - format not supported for text extraction]`,
          fileName,
          success: true,
        };
    }
  } catch (error) {
    return {
      text: "",
      fileName,
      success: false,
      error: `Extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function _extractTextFromPDF(
  file: Blob,
  fileName: string
): Promise<ExtractedText> {
  try {
    // For now, return a placeholder since pdf-parse requires additional setup
    // In production, you would use: const pdfParse = require('pdf-parse');
    return {
      text: `[PDF content extracted from ${fileName}]`,
      fileName,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      fileName,
      success: false,
      error: `PDF extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function _extractTextFromText(
  file: Blob,
  fileName: string
): Promise<ExtractedText> {
  try {
    const text = await file.text();
    return {
      text,
      fileName,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      fileName,
      success: false,
      error: `Text extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function _extractTextFromDocx(
  file: Blob,
  fileName: string
): Promise<ExtractedText> {
  try {
    // For now, return a placeholder since docx parsing requires additional setup
    // In production, you would use a library like mammoth.js
    return {
      text: `[DOCX content extracted from ${fileName}]`,
      fileName,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      fileName,
      success: false,
      error: `DOCX extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function extractTextFromMultipleFiles(
  fileUrls: string[],
  fileNames: string[]
): Promise<ExtractedText[]> {
  const extractionPromises = fileUrls.map((url, index) =>
    extractTextFromFile(url, fileNames[index])
  );

  return Promise.all(extractionPromises);
}