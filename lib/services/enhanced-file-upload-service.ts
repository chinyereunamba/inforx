"use client";

import { createClient } from "@/utils/supabase/client";
import { LoggingService } from "./logging-service";
import { User } from "@supabase/supabase-js";
import { MedicalRecordFormData } from "../types/medical-records";

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
  stage: "uploading" | "processing" | "complete";
}

export interface ChunkedUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
  filePath?: string;
  uploadId?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  chunks: number;
  uploadedChunks: number[];
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export class EnhancedFileUploadService {
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (increased from 10MB)
  private static CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private static MAX_CONCURRENT_CHUNKS = 3;

  private static ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/tiff",
    "text/plain",
  ];

  private static ALLOWED_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".tiff",
    ".txt",
  ];

  // Store active uploads for resume capability
  private static activeUploads = new Map<string, FileMetadata>();

  /**
   * Enhanced file validation with security checks
   */
  public static validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${this.formatFileSize(
          this.MAX_FILE_SIZE
        )}`,
      };
    }

    // Check for empty files
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File cannot be empty",
      };
    }

    // Check file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Accepted types: PDF, DOCX, PNG, JPG, WEBP, TIFF, TXT`,
      };
    }

    // Additional validation for file extension
    const fileExt = this.getFileExtension(file.name).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(fileExt)) {
      return {
        isValid: false,
        error: `Invalid file extension. Accepted extensions: ${this.ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
      };
    }

    // Basic security check for file name
    if (this.containsSuspiciousPatterns(file.name)) {
      return {
        isValid: false,
        error: "File name contains invalid characters",
      };
    }

    return { isValid: true };
  }

  /**
   * Check for suspicious patterns in filename
   */
  private static containsSuspiciousPatterns(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid filename characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved Windows names
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(filename));
  }

  /**
   * Generate thumbnail for image files
   */
  public static async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      return null;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions (max 200x200)
        const maxSize = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Chunked file upload with resume capability
   */
  public static async uploadFileChunked(
    formData: MedicalRecordFormData,
    file: File,
    user: User,
    onProgress?: (progress: UploadProgressEvent) => void
  ): Promise<ChunkedUploadResult> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique upload ID
      const uploadId = this.generateUploadId();
      const fileExt = this.getFileExtension(file.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${uploadId}${fileExt}`;
      const filePath = `medical-records/${user.id}/${fileName}`;

      // Calculate number of chunks
      const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);

      // Initialize file metadata
      const metadata: FileMetadata = {
        id: uploadId,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        chunks: totalChunks,
        uploadedChunks: [],
        status: "uploading",
      };

      this.activeUploads.set(uploadId, metadata);

      // Report initial progress
      onProgress?.({
        loaded: 0,
        total: file.size,
        percentage: 0,
        stage: "uploading",
      });

      // Create Supabase client
      const supabase = createClient();

      // Upload chunks with concurrency control
      const chunkPromises: Promise<void>[] = [];
      let uploadedBytes = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunkPromise = this.uploadChunk(
          file,
          chunkIndex,
          filePath,
          supabase,
          (chunkBytes) => {
            uploadedBytes += chunkBytes;
            const percentage = Math.round((uploadedBytes / file.size) * 100);

            onProgress?.({
              loaded: uploadedBytes,
              total: file.size,
              percentage,
              stage: "uploading",
            });
          }
        );

        chunkPromises.push(chunkPromise);

        // Control concurrency
        if (chunkPromises.length >= this.MAX_CONCURRENT_CHUNKS) {
          await Promise.all(chunkPromises);
          chunkPromises.length = 0;
        }
      }

      // Wait for remaining chunks
      if (chunkPromises.length > 0) {
        await Promise.all(chunkPromises);
      }

      // Mark as processing
      metadata.status = "processing";
      onProgress?.({
        loaded: file.size,
        total: file.size,
        percentage: 100,
        stage: "processing",
      });

      // Get public URL for file
      const { data: urlData } = supabase.storage
        .from("vault")
        .getPublicUrl(filePath);

      // Log successful upload
      await LoggingService.logAction(user, LoggingService.actions.UPLOAD_FILE, {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: filePath,
        upload_method: "chunked",
        chunks: totalChunks,
      });

      // Create the record via the API
      const recordData = {
        ...formData,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      };

      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const apiError = await response.json();
        throw new Error(apiError.error || "Failed to create medical record");
      }

      // Mark as complete
      metadata.status = "complete";
      onProgress?.({
        loaded: file.size,
        total: file.size,
        percentage: 100,
        stage: "complete",
      });

      // Clean up
      this.activeUploads.delete(uploadId);

      const result = await response.json();
      return {
        success: true,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath,
        uploadId,
      };
    } catch (error) {
      console.error("Chunked file upload error:", error);

      // Log error
      await LoggingService.logAction(user, "chunked_upload_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during upload",
      };
    }
  }

  /**
   * Upload a single chunk
   */
  private static async uploadChunk(
    file: File,
    chunkIndex: number,
    basePath: string,
    supabase: any,
    onChunkComplete: (chunkSize: number) => void
  ): Promise<void> {
    const start = chunkIndex * this.CHUNK_SIZE;
    const end = Math.min(start + this.CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const chunkPath = `${basePath}.chunk.${chunkIndex}`;

    const { error } = await supabase.storage
      .from("vault")
      .upload(chunkPath, chunk, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Chunk ${chunkIndex} upload failed: ${error.message}`);
    }

    onChunkComplete(chunk.size);
  }

  /**
   * Resume an interrupted upload
   */
  public static async resumeUpload(
    uploadId: string,
    onProgress?: (progress: UploadProgressEvent) => void
  ): Promise<ChunkedUploadResult> {
    const metadata = this.activeUploads.get(uploadId);
    if (!metadata) {
      return {
        success: false,
        error: "Upload session not found",
      };
    }

    // Continue from where we left off
    // This is a simplified version - in production, you'd need to check which chunks were actually uploaded
    return {
      success: false,
      error: "Resume functionality not fully implemented",
    };
  }

  /**
   * Cancel an active upload
   */
  public static cancelUpload(uploadId: string): boolean {
    const metadata = this.activeUploads.get(uploadId);
    if (metadata) {
      metadata.status = "error";
      metadata.error = "Upload cancelled by user";
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Get upload status
   */
  public static getUploadStatus(uploadId: string): FileMetadata | null {
    return this.activeUploads.get(uploadId) || null;
  }

  /**
   * Generate unique upload ID
   */
  private static generateUploadId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf("."));
  }

  /**
   * Format file size in a human-readable format
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Check if the storage bucket exists and is accessible
   */
  public static async checkStorageAccess(): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data } = await supabase.storage.getBucket("vault");
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Batch upload multiple files
   */
  public static async uploadMultipleFiles(
    files: File[],
    formDataArray: MedicalRecordFormData[],
    user: User,
    onProgress?: (fileIndex: number, progress: UploadProgressEvent) => void
  ): Promise<ChunkedUploadResult[]> {
    const results: ChunkedUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = formDataArray[i];

      const result = await this.uploadFileChunked(
        formData,
        file,
        user,
        (progress) => onProgress?.(i, progress)
      );

      results.push(result);
    }

    return results;
  }

  /**
   * Delete file from Supabase Storage
   */
  public static async deleteFile(
    filePath: string,
    user: User
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await supabase.storage.from("vault").remove([filePath]);

      if (error) {
        await LoggingService.logAction(user, "file_delete_error", {
          error: error.message,
          file_path: filePath,
        });

        return {
          success: false,
          error: `Delete failed: ${error.message}`,
        };
      }

      // Log successful deletion
      await LoggingService.logAction(user, LoggingService.actions.DELETE_FILE, {
        file_path: filePath,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("File delete error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during deletion",
      };
    }
  }
}
