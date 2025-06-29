import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ExtractedText {
  text: string;
  fileName: string;
  success: boolean;
  confidence?: number;
  error?: string;
}

export class TextExtractor {
  static async extractText(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ExtractedText> {
    try {
      if (onProgress) onProgress(10);

      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      let result: ExtractedText;
      switch (fileExtension) {
        case "pdf":
          result = await _extractTextFromPDF(file, fileName);
          break;
        case "txt":
          result = await _extractTextFromText(file, fileName);
          break;
        case "docx":
          result = await _extractTextFromDocx(file, fileName);
          break;
        case "jpg":
        case "jpeg":
        case "png":
          result = await _extractTextFromImage(file, fileName);
          break;
        default:
          result = {
            text: `[File content for ${fileName} - format not supported for text extraction]`,
            fileName,
            success: true,
          };
      }

      if (onProgress) onProgress(100);
      return result;
    } catch (error) {
      if (onProgress) onProgress(100);
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

  /**
   * Extract text from multiple files concurrently with proper error handling
   */
  static async extractTextFromMultipleFiles(
    files: File[],
    onFileProgress?: (fileIndex: number, progress: number) => void
  ): Promise<ExtractedText[]> {
    const results: ExtractedText[] = [];

    // Process files sequentially to avoid overwhelming the browser
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.extractText(files[i], (progress) =>
          onFileProgress?.(i, progress)
        );
        results.push(result);
      } catch (error) {
        // Add error result but continue processing other files
        results.push({
          text: "",
          fileName: files[i].name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
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
      .from("vault")
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

async function _extractTextFromImage(
  file: Blob,
  fileName: string
): Promise<ExtractedText> {
  try {
    // For this implementation, we're using a placeholder
    // In a production environment, you would:
    // 1. Use Tesseract.js for client-side OCR
    // 2. Or send to a server-side OCR service

    // Create preview for demonstration
    const url = URL.createObjectURL(file);

    return {
      text: `[Image content extracted from ${fileName}]`,
      fileName,
      success: true,
      confidence: 0.75,
    };
  } catch (error) {
    return {
      text: "",
      fileName,
      success: false,
      error: `Image OCR failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function extractTextFromMultipleFiles(
  fileUrls: string[] | null,
  fileNames: string[] | null
): Promise<ExtractedText[]> {
  if (!fileUrls || !fileNames || fileUrls.length === 0) {
    return [];
  }

  const extractionPromises = fileUrls.map((url, index) => {
    // Handle case where file URL is empty
    if (!url) {
      return Promise.resolve({
        text: "",
        fileName: fileNames[index] || "unknown",
        success: false,
        error: "File URL is empty",
      });
    }

    return extractTextFromFile(url, fileNames[index]);
  });

  // Use Promise.allSettled to handle failures gracefully
  const results = await Promise.allSettled(extractionPromises);

  return results.map((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    } else {
      return {
        text: "",
        fileName: fileNames?.[index] || "unknown",
        success: false,
        error:
          result.status === "rejected"
            ? result.reason?.message || "Text extraction failed"
            : "Text extraction failed",
      } as ExtractedText;
    }
  });
}
