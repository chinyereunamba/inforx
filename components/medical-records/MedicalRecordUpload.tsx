"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Calendar,
  Hospital,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  MedicalRecord,
  MedicalRecordFormData,
} from "@/lib/types/medical-records";
import { useMedicalRecords } from '@/hooks/useMedicalRecordsHook';

interface MedicalRecordUploadProps {
  onRecordAdded: (record: MedicalRecord) => void;
  onUploadComplete: () => void;
}

export default function MedicalRecordUpload({
  onRecordAdded,
  onUploadComplete,
}: MedicalRecordUploadProps) {
  const { createRecord } = useMedicalRecords();
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    title: "",
    type: "prescription",
    hospital_name: "",
    visit_date: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof MedicalRecordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Record title is required");
      return;
    }

    if (!formData.hospital_name.trim()) {
      setError("Hospital name is required");
      return;
    }

    if (!formData.visit_date) {
      setError("Visit date is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create record using service
      const record = await createRecord(
        formData,
        selectedFile || undefined
      );

      // Reset form
      setFormData({
        title: "",
        type: "prescription",
        hospital_name: "",
        visit_date: "",
        notes: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess("Medical record uploaded successfully!");
      onRecordAdded(record);
      onUploadComplete();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload medical record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {/* Record Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Record Title *
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Blood Test Results, X-Ray Scan"
            required
          />
        </div>
      </div>

      {/* Record Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Record Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleInputChange("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
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
          Hospital/Clinic Name *
        </label>
        <div className="relative">
          <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            id="hospital"
            value={formData.hospital_name}
            onChange={(e) => handleInputChange("hospital_name", e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., City General Hospital"
            required
          />
        </div>
      </div>

      {/* Visit Date */}
      <div>
        <label
          htmlFor="visit_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Visit Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            id="visit_date"
            value={formData.visit_date}
            onChange={(e) => handleInputChange("visit_date", e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Upload File (Optional)
        </label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            onChange={handleFileSelect}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PDF, DOCX, PNG, JPG (Max 10MB)
        </p>
        {selectedFile && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Selected: {selectedFile.name}
            </p>
          </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional notes about this medical record..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Medical Record
          </>
        )}
      </button>
    </form>
  );
}