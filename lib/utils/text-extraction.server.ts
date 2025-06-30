import { createClient } from "@supabase/supabase-js";
import mammoth from "mammoth";
import { ExtractedText } from "./text-extraction.client";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function _extractTextFromPDF(
  file: Blob,
  fileName: string
): Promise<ExtractedText> {
  try {
    // Create FormData to send to API
    const formData = new FormData();
    formData.append("file", file);

    // Call the API route
    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "PDF extraction failed");
    }

    return {
      text: result.text,
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
    const arrayBuffer = await file.arrayBuffer();
    const { value: text } = await mammoth.extractRawText({ arrayBuffer });

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
      error: `DOCX extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
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
