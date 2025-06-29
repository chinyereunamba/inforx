"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Download,
  Eye,
  Trash2,
  FileText,
  Calendar,
  Hospital,
  AlertTriangle,
  Loader2,
  FileImage,
  File,
  CheckSquare,
  Square,
  // FileDoc,
} from "lucide-react";
import { MedicalRecord } from "@/lib/types/medical-records";

interface MedicalRecordsListProps {
  records: MedicalRecord[];
  loading: boolean;
  onRecordDeleted: (recordId: string) => void;
  onRefresh: () => void;
  selectedRecordIds?: string[];
  onRecordSelection?: (recordId: string, isSelected: boolean) => void;
}

export default function MedicalRecordsList({
  records,
  loading,
  onRecordDeleted,
  onRefresh,
  selectedRecordIds = [],
  onRecordSelection,
}: MedicalRecordsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(
    null
  );
  const supabase = createClient();

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />;

    if (fileType.includes("pdf"))
      return <File className="h-4 w-4 text-red-500" />;
    if (fileType.includes("image"))
      return <FileImage className="h-4 w-4 text-green-500" />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <File className="h-4 w-4 text-blue-500" />;

    return <FileText className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      prescription: "Prescription",
      scan: "Scan",
      lab_result: "Lab Result",
      other: "Other",
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDelete = async (record: MedicalRecord) => {
    if (!confirm(`Are you sure you want to delete "${record.title}"?`)) {
      return;
    }

    setDeletingId(record.id);

    try {
      // Delete file from storage if it exists
      if (record.file_url) {
        const filePath = record.file_url.split("/").slice(-2).join("/");
        await supabase.storage.from("vault").remove([filePath]);
      }

      // Delete record from database
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", record.id);

      if (error) {
        throw new Error(`Failed to delete record: ${error.message}`);
      }

      onRecordDeleted(record.id);
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete record: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (record: MedicalRecord) => {
    if (!record.file_url) {
      alert("No file attached to this record");
      return;
    }

    try {
      const response = await fetch(record.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.file_name || "medical-record";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  const handleView = (record: MedicalRecord) => {
    setViewingRecord(record);
  };

  const handleRecordSelection = (recordId: string) => {
    if (onRecordSelection) {
      const isSelected = selectedRecordIds.includes(recordId);
      onRecordSelection(recordId, !isSelected);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading medical records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No medical records found
        </h3>
        <p className="text-gray-600 mb-4">
          Start by uploading your first medical record using the form on the
          left.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onRecordSelection && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    {selectedRecordIds.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Record
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => {
              const isSelected = selectedRecordIds.includes(record.id);
              return (
                <tr
                  key={record.id}
                  className={`hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  {onRecordSelection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRecordSelection(record.id)}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.title}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {record.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getTypeLabel(record.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Hospital className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {record.hospital_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(record.visit_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.file_url ? (
                      <div className="flex items-center">
                        {getFileIcon(record.file_type)}
                        <span className="text-sm text-gray-900 ml-2">
                          {record.file_name}
                        </span>
                        {record.file_size && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({formatFileSize(record.file_size)})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No file</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {record.file_url && (
                        <>
                          <button
                            onClick={() => handleView(record)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View record"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(record)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(record)}
                        disabled={deletingId === record.id}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                        title="Delete record"
                      >
                        {deletingId === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewingRecord.title}
              </h3>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {getTypeLabel(viewingRecord.type)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hospital
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingRecord.hospital_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Visit Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(viewingRecord.visit_date)}
                </p>
              </div>

              {viewingRecord.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingRecord.notes}
                  </p>
                </div>
              )}

              {viewingRecord.file_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {getFileIcon(viewingRecord.file_type)}
                    <span className="text-sm text-gray-900">
                      {viewingRecord.file_name}
                    </span>
                    {viewingRecord.file_size && (
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(viewingRecord.file_size)})
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleView(viewingRecord)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(viewingRecord)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
