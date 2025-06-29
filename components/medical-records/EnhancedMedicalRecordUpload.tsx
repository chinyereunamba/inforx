"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Calendar,
  Hospital,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  X,
  FileCheck,
  ImageIcon,
  FileIcon,
  Eye,
  Paperclip,
} from "lucide-react";
import { FileUploadService } from "@/lib/services/file-upload-service";
import { TextExtractor } from "@/lib/utils/text-extraction";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MedicalRecord,
  MedicalRecordFormData,
} from "@/lib/types/medical-records";
import { medicalRecordsService } from "@/lib/services/medical-records";

interface EnhancedMedicalRecordUploadProps {
  onRecordAdded: (record: MedicalRecord) => void;
  onUploadComplete: () => void;
}

export default function EnhancedMedicalRecordUpload({
  onRecordAdded,
  onUploadComplete,
}: EnhancedMedicalRecordUploadProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    title: "",
    type: "prescription",
    hospital_name: "",
    visit_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [uploadState, setUploadState] = useState<{
    status: "idle" | "uploading" | "processing" | "success" | "error";
    file: File | null;
    uploadProgress: number;
    processingProgress: number;
    error: string | null;
    filePreviewUrl: string | null;
    extractedText: string | null;
  }>({
    status: "idle",
    file: null,
    uploadProgress: 0,
    processingProgress: 0,
    error: null,
    filePreviewUrl: null,
    extractedText: null,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(
          (reject) => `${reject.file.name}: ${reject.errors[0].message}`
        );
        setUploadState((prev) => ({
          ...prev,
          status: "error",
          error: errors.join(", "),
        }));
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file
      const validation = FileUploadService.validateFile(file);
      if (!validation.isValid) {
        setUploadState((prev) => ({
          ...prev,
          status: "error",
          error: validation.error || "File validation failed",
        }));
        return;
      }

      // Create file preview URL for images
      let filePreviewUrl = null;
      if (file.type.startsWith("image/")) {
        filePreviewUrl = URL.createObjectURL(file);
      }

      // Update state with selected file
      setUploadState({
        status: "idle",
        file,
        uploadProgress: 0,
        processingProgress: 0,
        error: null,
        filePreviewUrl,
        extractedText: null,
      });

      // Try to extract text from the file for title suggestion
      try {
        setUploadState((prev) => ({
          ...prev,
          status: "processing",
        }));

        const extractionResult = await TextExtractor.extractText(
          file,
          (progress) => {
            setUploadState((prev) => ({
              ...prev,
              processingProgress: progress,
            }));
          }
        );

        if (extractionResult.success) {
          // Set extracted text
          setUploadState((prev) => ({
            ...prev,
            status: "idle",
            extractedText: extractionResult.text,
          }));

          // Try to auto-detect document type and suggest a title
          const docType = autoDetectDocumentType(extractionResult.text);
          const suggestedTitle = generateTitleFromExtractedText(
            extractionResult.text
          );

          if (suggestedTitle) {
            setFormData((prev) => ({
              ...prev,
              title: suggestedTitle,
              type:
                (docType as "prescription" | "scan" | "lab_result" | "other") ||
                prev.type,
            }));
          }
        } else {
          console.log(
            "Text extraction failed but continuing",
            extractionResult.error
          );
        }
      } catch (error) {
        console.error("Error during text extraction:", error);
        // Don't show error to user, just log it - we can still continue
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  // Handle input change
  const handleInputChange = (
    field: keyof MedicalRecordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    if (uploadState.filePreviewUrl) {
      URL.revokeObjectURL(uploadState.filePreviewUrl);
    }

    setUploadState({
      status: "idle",
      file: null,
      uploadProgress: 0,
      processingProgress: 0,
      error: null,
      filePreviewUrl: null,
      extractedText: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.hospital_name.trim()) {
      errors.hospital_name = "Hospital name is required";
    }

    if (!formData.visit_date) {
      errors.visit_date = "Visit date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: "You must be signed in to upload files",
      }));
      return;
    }

    // Check if we have a file to upload
    const file = uploadState.file;

    try {
      // If we have a file, upload it first
      if (file) {
        setUploadState((prev) => ({
          ...prev,
          status: "uploading",
          uploadProgress: 0,
        }));

        // Upload the file
        const uploadResult = await FileUploadService.uploadFile(
          file,
          user,
          (progress) => {
            setUploadState((prev) => ({
              ...prev,
              uploadProgress: progress.percentage,
            }));
          }
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "File upload failed");
        }

        // Create record with file
        const record = await medicalRecordsService.createRecord(
          {
            ...formData,
            // Add the extracted text as notes if we don't already have notes
            notes: formData.notes || uploadState.extractedText || undefined,
          },
          file
        );

        // Update state to success
        setUploadState({
          status: "success",
          file: null,
          uploadProgress: 100,
          processingProgress: 100,
          error: null,
          filePreviewUrl: null,
          extractedText: null,
        });

        // Reset form
        setFormData({
          title: "",
          type: "prescription",
          hospital_name: "",
          visit_date: new Date().toISOString().split("T")[0],
          notes: "",
        });

        // Notify parent components
        onRecordAdded(record);
        onUploadComplete();
      } else {
        // Create record without file
        const record = await medicalRecordsService.createRecord(formData);

        // Reset form
        setFormData({
          title: "",
          type: "prescription",
          hospital_name: "",
          visit_date: new Date().toISOString().split("T")[0],
          notes: "",
        });

        // Notify parent components
        onRecordAdded(record);
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (file.type.includes("word") || file.type.includes("document")) {
      return <FileCheck className="h-6 w-6 text-blue-600" />;
    } else {
      return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Auto-detect document type from text
  const autoDetectDocumentType = (text: string): string | null => {
    text = text.toLowerCase();

    if (
      text.includes("prescription") ||
      text.includes("rx:") ||
      text.includes("sig:") ||
      text.includes("take") ||
      text.includes("dose") ||
      text.includes("tablet") ||
      text.includes("mg")
    ) {
      return "prescription";
    } else if (
      text.includes("laboratory") ||
      text.includes("lab report") ||
      text.includes("results:") ||
      text.includes("reference range") ||
      text.includes("test:") ||
      text.includes("specimen")
    ) {
      return "lab_result";
    } else if (
      text.includes("scan") ||
      text.includes("x-ray") ||
      text.includes("mri") ||
      text.includes("ct") ||
      text.includes("ultrasound") ||
      text.includes("imaging") ||
      text.includes("radiolog")
    ) {
      return "scan";
    }

    return null;
  };

  // Generate title from extracted text
  const generateTitleFromExtractedText = (text: string): string | null => {
    // Try to find a title in the first few lines
    const lines = text.split("\n").slice(0, 10);

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines or very short lines
      if (!trimmedLine || trimmedLine.length < 5) continue;

      // Skip lines that are clearly not titles
      if (
        trimmedLine.includes(":") ||
        trimmedLine.includes("=") ||
        trimmedLine.toLowerCase().startsWith("date") ||
        trimmedLine.toLowerCase().startsWith("name") ||
        trimmedLine.toLowerCase().includes("patient")
      ) {
        continue;
      }

      // Found a potential title
      if (trimmedLine.length > 5 && trimmedLine.length < 60) {
        return trimmedLine;
      }
    }

    // Fallback: use the document type as part of the title
    const docType = autoDetectDocumentType(text);
    if (docType === "prescription") {
      return "Prescription";
    } else if (docType === "lab_result") {
      return "Laboratory Results";
    } else if (docType === "scan") {
      return "Medical Scan";
    }

    // Last resort
    return "Medical Document";
  };

  return (
    <div className="space-y-6">
      {/* Error display */}
      {uploadState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadState.error}</AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {uploadState.status === "success" && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Medical record uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* File upload section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Medical Document
        </label>

        {!uploadState.file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-700 mb-1">
                {isDragActive
                  ? "Drop your file here"
                  : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Support for PDF, DOCX, PNG, JPG (max 10MB)
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FileText className="mr-1 h-3 w-3" /> PDF
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FileCheck className="mr-1 h-3 w-3" /> DOCX
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <ImageIcon className="mr-1 h-3 w-3" /> JPG
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <ImageIcon className="mr-1 h-3 w-3" /> PNG
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Card className="border border-gray-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {uploadState.filePreviewUrl ? (
                    <img
                      src={uploadState.filePreviewUrl}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(uploadState.file)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-800">
                      {uploadState.file.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {FileUploadService.formatFileSize(uploadState.file.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploadState.status === "idle" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="View file"
                        onClick={() => {
                          if (uploadState.filePreviewUrl) {
                            window.open(uploadState.filePreviewUrl);
                          }
                        }}
                        disabled={!uploadState.filePreviewUrl}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Remove file"
                        onClick={handleRemoveFile}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {(uploadState.status === "uploading" ||
                    uploadState.status === "processing") && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              {uploadState.status === "uploading" && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadState.uploadProgress}%</span>
                  </div>
                  <Progress
                    value={uploadState.uploadProgress}
                    className="h-2"
                  />
                </div>
              )}

              {uploadState.status === "processing" && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Processing...</span>
                    <span>{uploadState.processingProgress}%</span>
                  </div>
                  <Progress
                    value={uploadState.processingProgress}
                    className="h-2"
                  />
                </div>
              )}

              {uploadState.extractedText && (
                <div className="mt-3 text-xs">
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      <Paperclip className="inline h-3 w-3 mr-1" />
                      View extracted text
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                      <pre className="text-gray-700 whitespace-pre-wrap">
                        {uploadState.extractedText.substring(0, 500)}
                        {uploadState.extractedText.length > 500 ? "..." : ""}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Record Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Record Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                validationErrors.title
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g., Blood Test Results, X-Ray Scan"
            />
          </div>
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.title}
            </p>
          )}
        </div>

        {/* Record Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Record Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="prescription">Prescription</option>
            <option value="scan">Scan (X-Ray, MRI, CT)</option>
            <option value="lab_result">Lab Result</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Hospital Name */}
        <div>
          <label
            htmlFor="hospital"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hospital/Clinic Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="hospital"
              value={formData.hospital_name}
              onChange={(e) =>
                handleInputChange("hospital_name", e.target.value)
              }
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                validationErrors.hospital_name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g., Lagos University Teaching Hospital"
            />
          </div>
          {validationErrors.hospital_name && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.hospital_name}
            </p>
          )}
        </div>

        {/* Visit Date */}
        <div>
          <label
            htmlFor="visit_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Visit Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              id="visit_date"
              value={formData.visit_date}
              onChange={(e) => handleInputChange("visit_date", e.target.value)}
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                validationErrors.visit_date
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
          </div>
          {validationErrors.visit_date && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.visit_date}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this medical record..."
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          disabled={
            uploadState.status === "uploading" ||
            uploadState.status === "processing"
          }
        >
          {uploadState.status === "uploading" ||
          uploadState.status === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadState.status === "uploading"
                ? "Uploading..."
                : "Processing..."}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Medical Record
            </>
          )}
        </Button>
      </form>

      {/* Tips for better results */}
      <div className="bg-sky-50 rounded-lg p-4 text-sm text-sky-700 border border-sky-200">
        <h4 className="font-medium flex items-center mb-2">
          <FileCheck className="h-4 w-4 mr-2" />
          Tips for best results
        </h4>
        <ul className="space-y-1 list-disc list-inside ml-2">
          <li>Ensure uploaded images are clear and well-lit</li>
          <li>PDFs should be properly scanned and text-recognizable</li>
          <li>Include the hospital or doctor's name for better organization</li>
          <li>
            If uploading prescriptions, double-check the dosage information is
            visible
          </li>
        </ul>
      </div>
    </div>
  );
}
