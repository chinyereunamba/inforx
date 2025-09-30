"use client";

import { createWorker, Worker } from "tesseract.js";

export interface TextExtractionResult {
  success: boolean;
  text: string;
  confidence: number;
  error?: string;
  processingTime?: number;
  method: "tesseract" | "pdf-parse" | "docx" | "plain-text";
  metadata?: {
    pageCount?: number;
    language?: string;
    wordCount?: number;
  };
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export class OCRTextExtractionService {
  private static tesseractWorker: Worker | null = null;
  private static isInitializing = false;

  /**
   * Initialize Tesseract worker
   */
  private static async initializeTesseract(): Promise<Worker> {
    if (this.tesseractWorker) {
      return this.tesseractWorker;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.tesseractWorker!;
    }

    this.isInitializing = true;

    try {
      this.tesseractWorker = await createWorker("eng", 1, {
        logger: (m) => {
          // Optional: log progress
          console.log("Tesseract:", m);
        },
      });

      // Configure for better medical document recognition
      await this.tesseractWorker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()[]{}/-+= \n\t",
        tessedit_pageseg_mode: "1", // Automatic page segmentation with OSD
        preserve_interword_spaces: "1",
      });

      return this.tesseractWorker;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Extract text from various file types
   */
  public static async extractText(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();

    try {
      // Determine extraction method based on file type
      if (file.type === "application/pdf") {
        return await this.extractFromPDF(file, onProgress);
      } else if (file.type.includes("document") || file.type.includes("word")) {
        return await this.extractFromDocx(file, onProgress);
      } else if (file.type.startsWith("image/")) {
        return await this.extractFromImage(file, onProgress);
      } else if (file.type === "text/plain") {
        return await this.extractFromPlainText(file);
      } else {
        return {
          success: false,
          text: "",
          confidence: 0,
          error: "Unsupported file type for text extraction",
          method: "tesseract",
          processingTime: Date.now() - startTime,
        };
      }
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during text extraction",
        method: "tesseract",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract text from images using Tesseract.js
   */
  private static async extractFromImage(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();

    try {
      onProgress?.({ status: "Initializing OCR engine...", progress: 10 });

      const worker = await this.initializeTesseract();

      onProgress?.({ status: "Processing image...", progress: 30 });

      // Convert file to image data
      const imageData = await this.fileToImageData(file);

      onProgress?.({ status: "Recognizing text...", progress: 50 });

      const { data } = await worker.recognize(imageData, {
        rectangle: undefined, // Process entire image
      });

      onProgress?.({ status: "Finalizing...", progress: 90 });

      // Clean up the extracted text
      const cleanedText = this.cleanExtractedText(data.text);
      const wordCount = cleanedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      onProgress?.({ status: "Complete", progress: 100 });

      return {
        success: true,
        text: cleanedText,
        confidence: data.confidence,
        method: "tesseract",
        processingTime: Date.now() - startTime,
        metadata: {
          language: "eng",
          wordCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error instanceof Error ? error.message : "OCR processing failed",
        method: "tesseract",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract text from PDF files (client-side using pdf-parse)
   */
  private static async extractFromPDF(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();

    try {
      onProgress?.({ status: "Reading PDF file...", progress: 20 });

      // For client-side PDF processing, we'll use a different approach
      // Since pdf-parse is primarily for Node.js, we'll send to server
      const formData = new FormData();
      formData.append("file", file);

      onProgress?.({ status: "Processing PDF...", progress: 50 });

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("PDF processing failed on server");
      }

      const result = await response.json();

      onProgress?.({ status: "Complete", progress: 100 });

      const cleanedText = this.cleanExtractedText(result.text || "");
      const wordCount = cleanedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      return {
        success: true,
        text: cleanedText,
        confidence: result.confidence || 95, // PDF text extraction is usually high confidence
        method: "pdf-parse",
        processingTime: Date.now() - startTime,
        metadata: {
          pageCount: result.pageCount,
          wordCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error instanceof Error ? error.message : "PDF processing failed",
        method: "pdf-parse",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract text from DOCX files
   */
  private static async extractFromDocx(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();

    try {
      onProgress?.({ status: "Reading DOCX file...", progress: 20 });

      // For DOCX processing, we'll also use server-side processing
      const formData = new FormData();
      formData.append("file", file);

      onProgress?.({ status: "Processing document...", progress: 50 });

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("DOCX processing failed on server");
      }

      const result = await response.json();

      onProgress?.({ status: "Complete", progress: 100 });

      const cleanedText = this.cleanExtractedText(result.text || "");
      const wordCount = cleanedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      return {
        success: true,
        text: cleanedText,
        confidence: result.confidence || 98, // DOCX text extraction is very high confidence
        method: "docx",
        processingTime: Date.now() - startTime,
        metadata: {
          wordCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error:
          error instanceof Error ? error.message : "DOCX processing failed",
        method: "docx",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract text from plain text files
   */
  private static async extractFromPlainText(
    file: File
  ): Promise<TextExtractionResult> {
    const startTime = Date.now();

    try {
      const text = await file.text();
      const cleanedText = this.cleanExtractedText(text);
      const wordCount = cleanedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      return {
        success: true,
        text: cleanedText,
        confidence: 100, // Plain text is 100% confidence
        method: "plain-text",
        processingTime: Date.now() - startTime,
        metadata: {
          wordCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error:
          error instanceof Error ? error.message : "Failed to read text file",
        method: "plain-text",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Convert file to image data for Tesseract
   */
  private static async fileToImageData(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Clean and preprocess extracted text
   */
  private static cleanExtractedText(text: string): string {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove common OCR artifacts
        .replace(/[|]/g, "I") // Common OCR mistake
        .replace(/[0O]/g, (match, offset, string) => {
          // Context-aware O/0 correction
          const before = string[offset - 1];
          const after = string[offset + 1];
          if (/\d/.test(before) || /\d/.test(after)) {
            return "0";
          }
          return "O";
        })
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
  public static analyzeMedicalContent(text: string): {
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

  /**
   * Cleanup Tesseract worker
   */
  public static async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }

  /**
   * Get OCR engine status
   */
  public static getStatus(): {
    isInitialized: boolean;
    isInitializing: boolean;
  } {
    return {
      isInitialized: !!this.tesseractWorker,
      isInitializing: this.isInitializing,
    };
  }
}
