'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UploadConfig {
  maxSize: number;
  acceptedTypes: string[];
  maxFiles: number;
}

export interface FileValidationError {
  code: string;
  message: string;
  file: File;
}

const DEFAULT_CONFIG: UploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ],
  maxFiles: 5
};

export function useFileUpload(config: Partial<UploadConfig> = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const validateFile = useCallback((file: File): FileValidationError | null => {
    // Check file size
    if (file.size > finalConfig.maxSize) {
      return {
        code: 'file-too-large',
        message: `File "${file.name}" is too large. Maximum size is ${(finalConfig.maxSize / 1024 / 1024).toFixed(1)}MB.`,
        file
      };
    }

    // Check file type
    if (!finalConfig.acceptedTypes.includes(file.type)) {
      return {
        code: 'file-invalid-type',
        message: `File "${file.name}" has an unsupported format. Please use PDF, DOCX, JPG, or PNG files.`,
        file
      };
    }

    return null;
  }, [finalConfig]);

  const validateFiles = useCallback((files: File[]): FileValidationError[] => {
    const errors: FileValidationError[] = [];

    // Check number of files
    if (files.length > finalConfig.maxFiles) {
      errors.push({
        code: 'too-many-files',
        message: `You can only upload up to ${finalConfig.maxFiles} files at once.`,
        file: files[0] // Use first file as reference
      });
      return errors;
    }

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      }
    });

    return errors;
  }, [finalConfig, validateFile]);

  const uploadFile = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    try {
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        onProgress?.(progress);
      };

      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateProgress(progress);
      }

      // Here you would implement the actual upload logic
      // For now, we'll simulate a successful upload
      const uploadResult = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // In real implementation, this would be the server URL
      };

      // Clean up progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });

      return { success: true, data: uploadResult };
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Clean up progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadFiles = useCallback(async (
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<Array<{ success: boolean; data?: any; error?: string }>> => {
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      // Show validation errors
      validationErrors.forEach(error => {
        toast.error(error.message);
      });
      return validationErrors.map(error => ({ 
        success: false, 
        error: error.message 
      }));
    }

    const results = await Promise.all(
      files.map((file, index) =>
        uploadFile(file, (progress) => onProgress?.(index, progress))
      )
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
    }
    
    if (failureCount > 0) {
      toast.error(`${failureCount} file(s) failed to upload`);
    }

    return results;
  }, [validateFiles, uploadFile]);

  return {
    isUploading,
    uploadProgress,
    validateFile,
    validateFiles,
    uploadFile,
    uploadFiles
  };
}