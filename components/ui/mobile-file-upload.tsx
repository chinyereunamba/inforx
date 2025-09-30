"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { TouchButton } from "./touch-button";
import {
  useScreenSize,
  touchTargets,
  gestureClasses,
  mobileAnimations,
} from "@/lib/utils/responsive";
import {
  Upload,
  Camera,
  FileText,
  Image as ImageIcon,
  X,
  Check,
} from "lucide-react";

interface MobileFileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export default function MobileFileUpload({
  onFileSelect,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = true,
  maxSize = 10,
  className,
  disabled = false,
}: MobileFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useScreenSize();

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        const sizeInMB = file.size / (1024 * 1024);
        return sizeInMB <= maxSize;
      });

      setSelectedFiles(validFiles);
      onFileSelect(validFiles);
    },
    [maxSize, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, handleFileSelect]
  );

  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (!disabled && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg",
          mobileAnimations.mediumTransition,
          "p-6 sm:p-8 text-center",
          touchTargets.spacious,
          gestureClasses.swipeable,
          isDragOver
            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 scale-[1.02]"
            : "border-slate-300 dark:border-slate-600",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
        )}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
              Upload Medical Documents
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {isMobile
                ? "Tap to select files"
                : "Drag and drop files here, or click to select"}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              Supports PDF, DOC, DOCX, and images up to {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Mobile action buttons */}
      {isMobile && (
        <div className="grid grid-cols-2 gap-3">
          <TouchButton
            onClick={openFileSelector}
            variant="outline"
            className={cn(
              "flex items-center justify-center space-x-2 h-14",
              mobileAnimations.bounceScale
            )}
            disabled={disabled}
            touchSize="spacious"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Files</span>
          </TouchButton>
          <TouchButton
            onClick={openCamera}
            variant="outline"
            className={cn(
              "flex items-center justify-center space-x-2 h-14",
              mobileAnimations.bounceScale
            )}
            disabled={disabled}
            touchSize="spacious"
          >
            <Camera className="w-5 h-5" />
            <span className="font-medium">Camera</span>
          </TouchButton>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <TouchButton
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-slate-500 hover:text-red-500"
                  touchSize="minimum"
                >
                  <X className="w-4 h-4" />
                </TouchButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
