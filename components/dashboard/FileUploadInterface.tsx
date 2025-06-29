"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  File,
  Image,
  FileText,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  preview?: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  result?: InterpretationResult;
  error?: string;
}

interface InterpretationResult {
  id: string;
  simpleExplanation: string;
  recommendedActions: string[];
  warnings: string[];
  confidence: number;
}

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUploadInterface() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Animation effects
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (uploadZoneRef.current) {
        gsap.fromTo(
          uploadZoneRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }
    }, uploadZoneRef);

    return () => ctx.revert();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error: any) => {
        let message = `Error with ${file.name}: `;
        switch (error.code) {
          case "file-too-large":
            message += "File is too large. Maximum size is 10MB.";
            break;
          case "file-invalid-type":
            message +=
              "File type not supported. Please use PDF, DOCX, JPG, or PNG.";
            break;
          default:
            message += error.message;
        }
        toast.error(message);
      });
    });

    // Process accepted files
    acceptedFiles.forEach((file) => {
      const newFile: UploadedFile = {
        file,
        status: "uploading",
        progress: 0,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        newFile.preview = URL.createObjectURL(file);
      }

      setUploadedFiles((prev) => [...prev, newFile]);

      // Start upload simulation
      simulateUpload(file);
    });

    // Animate upload zone
    if (uploadZoneRef.current) {
      gsap.to(uploadZoneRef.current, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
    }

    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const simulateUpload = async (file: File) => {
    const fileIndex = uploadedFiles.length;

    // Upload phase
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadedFiles((prev) =>
        prev.map((f, i) => (i === fileIndex ? { ...f, progress } : f))
      );
    }

    // Processing phase
    setUploadedFiles((prev) =>
      prev.map((f, i) =>
        i === fileIndex ? { ...f, status: "processing", progress: 0 } : f
      )
    );

    // Simulate AI processing
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setUploadedFiles((prev) =>
        prev.map((f, i) => (i === fileIndex ? { ...f, progress } : f))
      );
    }

    // Complete with mock result
    const mockResult: InterpretationResult = {
      id: `result-${file.name}-${fileIndex}`,
      simpleExplanation: `Analysis complete for ${file.name}. This appears to be a medical document with important health information.`,
      recommendedActions: [
        "Follow medication schedule as prescribed",
        "Schedule follow-up appointment in 2 weeks",
        "Monitor symptoms daily",
      ],
      warnings: [
        "Contact doctor if symptoms worsen",
        "Do not skip prescribed medications",
      ],
      confidence: 92,
    };

    setUploadedFiles((prev) =>
      prev.map((f, i) =>
        i === fileIndex
          ? {
              ...f,
              status: "completed",
              progress: 100,
              result: mockResult,
            }
          : f
      )
    );

    // Animate results appearance
    setTimeout(() => {
      if (resultsRef.current) {
        gsap.fromTo(
          resultsRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
        );
      }
    }, 100);
  };

  const removeFile = (index: number) => {
    const file = uploadedFiles[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }

    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  const retryFile = (index: number) => {
    const file = uploadedFiles[index];
    setUploadedFiles((prev) =>
      prev.map((f, i) =>
        i === index
          ? { ...f, status: "uploading", progress: 0, error: undefined }
          : f
      )
    );
    simulateUpload(file.file);
  };

  const openCamera = () => {
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* File Upload Zone */}
      <FileUploadZone
        ref={uploadZoneRef}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={dropzoneActive || isDragActive}
        onCameraClick={openCamera}
      />

      {/* Upload Progress Section */}
      {uploadedFiles.length > 0 && (
        <div ref={progressRef} className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Upload Progress
          </h3>
          {uploadedFiles.map((uploadedFile, index) => (
            <UploadProgress
              key={`${uploadedFile.file.name}-${index}`}
              uploadedFile={uploadedFile}
              onRemove={() => removeFile(index)}
              onRetry={() => retryFile(index)}
            />
          ))}
        </div>
      )}

      {/* Results Section */}
      <div ref={resultsRef} className="space-y-4">
        {uploadedFiles
          .filter((f) => f.status === "completed" && f.result) 
          .map((uploadedFile, index) => (
            <ResultCard
              key={`result-${uploadedFile.file.name}-${index}`}
              result={uploadedFile.result!}
              fileName={uploadedFile.file.name}
            />
          ))}
      </div>
    </div>
  );
}

// FileUploadZone Component
const FileUploadZone = React.forwardRef<
  HTMLDivElement,
  {
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
    onCameraClick: () => void;
  }
>(({ getRootProps, getInputProps, isDragActive, onCameraClick }, ref) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps()} 
          ref={ref}
          className={`
            aspect-square max-h-80 border-2 border-dashed transition-all duration-300 cursor-pointer
            flex flex-col items-center justify-center p-6 space-y-4
            ${
              isDragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-25"
            }
          `}
          role="button"
          tabIndex={0}
          aria-label="Upload medical documents"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // Trigger file dialog
            }
          }}
        >
          <input {...getInputProps()} aria-describedby="upload-description" />

          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
            ${isDragActive ? "bg-emerald-500" : "bg-emerald-100"}
          `}
          >
            <Upload
              className={`h-8 w-8 ${  
                isDragActive ? "text-white" : "text-emerald-600"
              }`}
            />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {isDragActive ? "Drop files here" : "Upload Medical Documents"} 
            </h3>
            <p id="upload-description" className="text-slate-600 max-w-sm"> 
              Drag and drop your files here, or click to browse. Supports PDF,
              DOCX, JPG, and PNG files up to 10MB.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
              onClick={(e) => {
                e.stopPropagation();
                // Handled by dropzone
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Browse Files
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="md:hidden bg-sky-500 hover:bg-sky-600 text-white border-sky-500" 
              onClick={(e) => {
                e.stopPropagation();
                onCameraClick();
              }}
              aria-label="Take photo with camera"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FileUploadZone.displayName = "FileUploadZone";

// UploadProgress Component
function UploadProgress({
  uploadedFile,
  onRemove,
  onRetry,
}: {
  uploadedFile: UploadedFile;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploading":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "AI Processing...";
      case "completed":
        return "Complete";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* File Preview */}
        <div className="flex-shrink-0">
          {uploadedFile.preview ? (
            <img
              src={uploadedFile.preview}
              alt="File preview"
              className="w-12 h-12 object-cover rounded border"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center">
              {getFileIcon(uploadedFile.file.name)}
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
            <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB</span>
            {uploadedFile.status === "processing" && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Analyzing with AI</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploadedFile.status !== "completed" &&
            uploadedFile.status !== "error" && (
              <Progress
                value={Math.max(0, Math.min(100, uploadedFile.progress || 0))}
                className="h-2"
                aria-label={`${getStatusText(uploadedFile.status)} ${
                  uploadedFile.progress || 0
                }%`}
              />
            )}

          {/* Error Message */}
          {uploadedFile.error && (
            <p className="text-xs text-red-600 mt-1" role="alert">
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
              aria-label="View results"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {uploadedFile.status === "error" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-8 w-8 p-0 text-blue-600"
              aria-label="Retry upload"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ProcessingView Component
function ProcessingView({ fileName }: { fileName: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center space-x-4">
        <div className="animate-spin">
          <Loader2 className="h-8 w-8 text-sky-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            AI Processing in Progress
          </h3>
          <p className="text-slate-600">
            Analyzing {fileName} with advanced medical AI...
          </p>
        </div>
      </div>
    </Card>
  );
}

// ResultCard Component
function ResultCard({
  result,
  fileName,
}: {
  result: InterpretationResult;
  fileName: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-sky-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Analysis Results: {fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Badge variant="secondary">{result.confidence}% Confidence</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Simple Explanation */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Summary
          </h4>
          <p className="text-slate-700 leading-relaxed">
            {result.simpleExplanation}
          </p>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {result.recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-700 font-semibold text-xs">
                    {index + 1}
                  </span>
                </div>
                <span className="text-slate-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Important Notes
            </h4>
            <ul className="space-y-2">
              {result.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" size="sm">
            Share Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}