"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Eye,
  Trash2,
  Camera,
  Plus,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  EnhancedFileUploadService,
  UploadProgressEvent,
  FileMetadata,
} from "@/lib/services/enhanced-file-upload-service";
import { MedicalRecordFormData } from "@/lib/types/medical-records";
import { useAuthStore } from "@/lib/stores/auth-store";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  thumbnail?: string;
  status:
    | "pending"
    | "uploading"
    | "processing"
    | "completed"
    | "error"
    | "paused";
  progress: number;
  error?: string;
  uploadId?: string;
  formData?: MedicalRecordFormData;
}

interface EnhancedMultiFileUploadProps {
  onFilesUploaded?: (results: any[]) => void;
  onUploadProgress?: (fileId: string, progress: UploadProgressEvent) => void;
  maxFiles?: number;
  autoUpload?: boolean;
  className?: string;
}

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff"],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function EnhancedMultiFileUpload({
  onFilesUploaded,
  onUploadProgress,
  maxFiles = 10,
  autoUpload = false,
  className = "",
}: EnhancedMultiFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  // Generate thumbnails for image files
  const generateThumbnail = useCallback(
    async (file: File): Promise<string | undefined> => {
      if (!file.type.startsWith("image/")) return undefined;

      try {
        const thumbnail = await EnhancedFileUploadService.generateThumbnail(
          file
        );
        return thumbnail || undefined;
      } catch (error) {
        console.warn("Failed to generate thumbnail:", error);
        return undefined;
      }
    },
    []
  );

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          let message = `Error with ${file.name}: `;
          switch (error.code) {
            case "file-too-large":
              message += `File is too large. Maximum size is ${EnhancedFileUploadService.formatFileSize(
                MAX_FILE_SIZE
              )}.`;
              break;
            case "file-invalid-type":
              message +=
                "File type not supported. Please use PDF, DOCX, JPG, PNG, WEBP, TIFF, or TXT.";
              break;
            case "too-many-files":
              message += `Too many files. Maximum ${maxFiles} files allowed.`;
              break;
            default:
              message += error.message;
          }
          toast.error(message);
        });
      });

      // Check if adding these files would exceed the limit
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast.error(
          `Cannot add ${acceptedFiles.length} files. Maximum ${maxFiles} files allowed.`
        );
        return;
      }

      // Process accepted files
      const newFiles: UploadedFile[] = [];

      for (const file of acceptedFiles) {
        // Validate file
        const validation = EnhancedFileUploadService.validateFile(file);
        if (!validation.isValid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        const fileId = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`;

        const newFile: UploadedFile = {
          id: fileId,
          file,
          status: "pending",
          progress: 0,
        };

        // Create preview for images
        if (file.type.startsWith("image/")) {
          newFile.preview = URL.createObjectURL(file);
          // Generate thumbnail asynchronously
          generateThumbnail(file).then((thumbnail) => {
            if (thumbnail) {
              setUploadedFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, thumbnail } : f))
              );
            }
          });
        }

        newFiles.push(newFile);
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      if (autoUpload && newFiles.length > 0) {
        // Auto-upload files
        startUpload(newFiles.map((f) => f.id));
      }

      toast.success(`${acceptedFiles.length} file(s) added successfully`);
    },
    [uploadedFiles.length, maxFiles, autoUpload, generateThumbnail]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    maxFiles: maxFiles - uploadedFiles.length,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: uploadedFiles.length >= maxFiles || isUploading,
  });

  // Start upload for specific files
  const startUpload = useCallback(
    async (fileIds: string[]) => {
      if (!user) {
        toast.error("Please log in to upload files");
        return;
      }

      setIsUploading(true);

      for (const fileId of fileIds) {
        const fileData = uploadedFiles.find((f) => f.id === fileId);
        if (!fileData || fileData.status !== "pending") continue;

        // Update status to uploading
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "uploading" as const } : f
          )
        );

        try {
          // Create basic form data (in a real app, you'd collect this from user)
          const formData: MedicalRecordFormData = {
            title: fileData.file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            type: "other", // Default type
            hospital_name: "Unknown Hospital", // Default hospital
            visit_date: new Date().toISOString().split("T")[0],
            notes: "",
          };

          const result = await EnhancedFileUploadService.uploadFileChunked(
            formData,
            fileData.file,
            user,
            (progress) => {
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === fileId
                    ? {
                        ...f,
                        progress: progress.percentage,
                        status:
                          progress.stage === "complete"
                            ? "completed"
                            : progress.stage === "processing"
                            ? "processing"
                            : "uploading",
                      }
                    : f
                )
              );
              onUploadProgress?.(fileId, progress);
            }
          );

          if (result.success) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? { ...f, status: "completed" as const, progress: 100 }
                  : f
              )
            );
            toast.success(`${fileData.file.name} uploaded successfully`);
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? { ...f, status: "error" as const, error: result.error }
                  : f
              )
            );
            toast.error(
              `Failed to upload ${fileData.file.name}: ${result.error}`
            );
          }
        } catch (error) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "error" as const,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  }
                : f
            )
          );
          toast.error(`Failed to upload ${fileData.file.name}`);
        }
      }

      setIsUploading(false);
    },
    [uploadedFiles, user, onUploadProgress]
  );

  // Remove file
  const removeFile = useCallback(
    (fileId: string) => {
      const file = uploadedFiles.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }

      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File removed");
    },
    [uploadedFiles]
  );

  // Retry upload
  const retryUpload = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "pending" as const,
                progress: 0,
                error: undefined,
              }
            : f
        )
      );
      startUpload([fileId]);
    },
    [startUpload]
  );

  // Open camera for mobile
  const openCamera = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        onDrop(Array.from(files), []);
      }
    };
    input.click();
  }, [onDrop]);

  // Get file icon
  const getFileIcon = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (file.type.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-slate-500" />;
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return "text-slate-600";
      case "uploading":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "paused":
        return "text-orange-600";
      default:
        return "text-slate-600";
    }
  }, []);

  // Get status text
  const getStatusText = useCallback((status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return "Ready to upload";
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Complete";
      case "error":
        return "Error";
      case "paused":
        return "Paused";
      default:
        return "Unknown";
    }
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const pendingFiles = uploadedFiles.filter((f) => f.status === "pending");
  const canUpload = pendingFiles.length > 0 && !isUploading && user;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Upload Zone */}
      {uploadedFiles.length < maxFiles && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={`
                aspect-square max-h-80 border-2 border-dashed transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center p-6 space-y-4
                ${
                  isDragActive || dropzoneActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-25"
                }
                ${
                  uploadedFiles.length >= maxFiles || isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
              role="button"
              tabIndex={0}
              aria-label="Upload medical documents"
            >
              <input {...getInputProps()} ref={fileInputRef} />

              <div
                className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
                ${
                  isDragActive || dropzoneActive
                    ? "bg-emerald-500"
                    : "bg-emerald-100"
                }
              `}
              >
                <Upload
                  className={`h-8 w-8 ${
                    isDragActive || dropzoneActive
                      ? "text-white"
                      : "text-emerald-600"
                  }`}
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {isDragActive || dropzoneActive
                    ? "Drop files here"
                    : "Upload Medical Documents"}
                </h3>
                <p className="text-slate-600 max-w-sm">
                  Drag and drop your files here, or click to browse.
                  {uploadedFiles.length > 0 &&
                    ` (${uploadedFiles.length}/${maxFiles} files)`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                  disabled={uploadedFiles.length >= maxFiles || isUploading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="md:hidden bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCamera();
                  }}
                  disabled={uploadedFiles.length >= maxFiles || isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
              </div>

              <div className="flex gap-2 text-xs text-slate-500">
                <Badge variant="secondary">PDF</Badge>
                <Badge variant="secondary">DOCX</Badge>
                <Badge variant="secondary">JPG</Badge>
                <Badge variant="secondary">PNG</Badge>
                <Badge variant="secondary">WEBP</Badge>
                <Badge variant="secondary">TIFF</Badge>
                <Badge variant="secondary">TXT</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Controls */}
      {!autoUpload && uploadedFiles.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={() => startUpload(pendingFiles.map((f) => f.id))}
            disabled={!canUpload}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {pendingFiles.length} File
                {pendingFiles.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setUploadedFiles([])}
            disabled={isUploading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Files ({uploadedFiles.length}/{maxFiles})
          </h3>

          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.thumbnail ? (
                      <img
                        src={uploadedFile.thumbnail}
                        alt="Thumbnail"
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center">
                        {getFileIcon(uploadedFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {uploadedFile.file.name}
                      </h4>
                      <span
                        className={`text-xs font-medium ${getStatusColor(
                          uploadedFile.status
                        )}`}
                      >
                        {getStatusText(uploadedFile.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>
                        {EnhancedFileUploadService.formatFileSize(
                          uploadedFile.file.size
                        )}
                      </span>
                      {uploadedFile.status === "processing" && (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Processing with AI</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(uploadedFile.status === "uploading" ||
                      uploadedFile.status === "processing") && (
                      <Progress
                        value={Math.max(
                          0,
                          Math.min(100, uploadedFile.progress)
                        )}
                        className="h-2"
                      />
                    )}

                    {/* Error Message */}
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {uploadedFile.status === "error" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(uploadedFile.id)}
                        className="h-8 w-8 p-0 text-blue-600"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      disabled={
                        uploadedFile.status === "uploading" ||
                        uploadedFile.status === "processing"
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-sky-50 rounded-lg p-4 text-sm text-sky-700 border border-sky-200">
        <h4 className="font-medium flex items-center mb-2">
          <Upload className="h-4 w-4 mr-2" />
          Upload Tips
        </h4>
        <ul className="space-y-1 list-disc list-inside ml-2">
          <li>
            Maximum file size:{" "}
            {EnhancedFileUploadService.formatFileSize(MAX_FILE_SIZE)}
          </li>
          <li>Supported formats: PDF, DOCX, JPG, PNG, WEBP, TIFF, TXT</li>
          <li>You can upload up to {maxFiles} files at once</li>
          <li>Large files are uploaded in chunks for better reliability</li>
          <li>Images will automatically generate thumbnails</li>
        </ul>
      </div>
    </div>
  );
}
 