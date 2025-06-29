"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  RefreshCcw,
  X,
  FileImage,
  Download,
  Eye,
  Trash2,
  CloudOff,
  CheckSquare,
} from "lucide-react";

interface FileUploadProgressProps {
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  uploadProgress: number;
  processingProgress: number;
  status: "uploading" | "processing" | "error" | "success" | "idle";
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDownload?: () => void;
}

export function FileUploadProgress({
  fileName,
  fileSize,
  fileType,
  fileUrl,
  uploadProgress,
  processingProgress,
  status,
  error,
  onRetry,
  onCancel,
  onDelete,
  onView,
  onDownload,
}: FileUploadProgressProps) {
  const [totalProgress, setTotalProgress] = useState(0);

  // Calculate total progress combining upload and processing steps
  useEffect(() => {
    let progress = 0;
    
    if (status === "uploading") {
      // During upload, progress is 0-50%
      progress = (uploadProgress / 100) * 50;
    } else if (status === "processing") {
      // During processing, progress is 50-100%
      progress = 50 + (processingProgress / 100) * 50;
    } else if (status === "success") {
      progress = 100;
    } else if (status === "error") {
      progress = 0;
    }
    
    setTotalProgress(progress);
  }, [status, uploadProgress, processingProgress]);

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (!fileType) return <FileText className="h-5 w-5 text-slate-500" />;

    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.startsWith("image/")) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes("document") || fileType.includes("word")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }

    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (status) {
      case "uploading":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Uploading
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Error
          </Badge>
        );
      case "success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Complete
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 truncate max-w-[150px] sm:max-w-xs">
                {fileName}
              </h4>
              <div className="flex items-center mt-1 space-x-2">
                {fileSize && (
                  <span className="text-xs text-slate-500">
                    {formatFileSize(fileSize)}
                  </span>
                )}
                {getStatusBadge()}
              </div>
            </div>
          </div>

          <div className="flex space-x-1">
            {status === "success" && (
              <>
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onView}
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onDownload && fileUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onDownload}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-red-500"
                    onClick={onDelete}
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            {(status === "uploading" || status === "processing") && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onCancel}
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {status === "error" && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onRetry}
                title="Retry"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar (show for uploading and processing) */}
        {(status === "uploading" || status === "processing") && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {status === "uploading" ? "Uploading..." : "Processing..."}
              </span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        )}

        {/* Success Message */}
        {status === "success" && (
          <div className="mt-2 flex items-center text-green-600 text-xs">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>Upload successful</span>
          </div>
        )}

        {/* Error Message */}
        {status === "error" && error && (
          <div className="mt-2">
            <Alert variant="destructive" className="p-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}