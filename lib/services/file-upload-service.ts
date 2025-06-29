"use client";

import { createClient } from "@/utils/supabase/client";
import { LoggingService } from "./logging-service";
import { User } from "@supabase/supabase-js";

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
  filePath?: string;
}

export class FileUploadService {
  private static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  private static ALLOWED_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg",
  ];

  /**
   * Validate file before upload
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

    // Check file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Accepted types: PDF, DOCX, PNG, JPG`,
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

    return { isValid: true };
  }

  /**
   * Upload file to Supabase Storage
   */
  public static async uploadFile(
    file: File,
    user: User,
    onProgress?: (progress: UploadProgressEvent) => void
  ): Promise<UploadResult> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique file path
      const fileExt = this.getFileExtension(file.name);
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileName = `${timestamp}_${randomId}${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Create Supabase client
      const supabase = createClient();

      // Upload file
      const { data, error } = await supabase.storage
        .from("vault")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
          // Custom upload handler for progress tracking
          ...(onProgress && {
            onUploadProgress: (progress: {
              loaded: number;
              totalBytes: number;
            }) => {
              onProgress({
                loaded: progress.loaded,
                total: progress.totalBytes,
                percentage: Math.round(
                  (progress.loaded / progress.totalBytes) * 100
                ),
              });
            },
          }),
        });

      if (error) {
        // Log upload error
        await LoggingService.logAction(user, "file_upload_error", {
          error: error.message,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        });

        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

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
      });

      return {
        success: true,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath,
      };
    } catch (error) {
      console.error("File upload error:", error);
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
}
