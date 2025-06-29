"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Tag,
  X,
  Eye,
  Download,
  FileImage,
  FileCheck,
  Pill,
  AlertTriangle,
} from "lucide-react";
import { MedicalRecord } from "@/lib/types/medical-records";

interface RecordCardProps {
  record: MedicalRecord;
  onDelete: () => void;
  onView?: () => void;
}

export default function RecordCard({ record, onDelete, onView }: RecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <Pill className="h-5 w-5 text-blue-500" />;
      case "scan":
        return <FileImage className="h-5 w-5 text-purple-500" />;
      case "lab_result":
        return <FileCheck className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
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

  const getProcessingStatusBadge = () => {
    if (!record.processing_status || record.processing_status === "idle") return null;
    
    switch (record.processing_status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        );
      case "complete":
        return record.text_content ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Text Extracted
          </Badge>
        ) : null;
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Extraction Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${record.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {getTypeIcon(record.type)}
            <h3
              className="font-semibold text-gray-900 truncate max-w-[200px]"
              title={record.title}
            >
              {record.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {getTypeLabel(record.type)}
            </Badge>
            {getProcessingStatusBadge()}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>{formatDate(record.visit_date)}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            <span className="truncate">{record.hospital_name}</span>
          </div>

          {record.file_name && (
            <div className="flex items-center text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              <span className="truncate">{record.file_name}</span>
              {record.file_size && (
                <span className="ml-1">({formatFileSize(record.file_size)})</span>
              )}
            </div>
          )}
        </div>

        {record.notes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">{record.notes}</p>
          </div>
        )}

        {/* Extracted text section - only shown when expanded */}
        {isExpanded && record.text_content && (
          <div className="mb-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">Extracted Text</h4>
              {record.processed_at && (
                <span className="text-xs text-gray-500">
                  {new Date(record.processed_at).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
              {record.text_content}
            </div>
          </div>
        )}

        {/* Processing error */}
        {isExpanded && record.processing_status === "failed" && record.processing_error && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-medium text-red-700">Processing Error</h4>
                <p className="text-xs text-red-600">{record.processing_error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          {record.text_content || record.processing_status === "failed" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="text-xs text-gray-500 px-2"
            >
              {isExpanded ? "Hide details" : "Show details"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex justify-end gap-2">
            {record.file_url && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={onView}
                  asChild
                >
                  <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  asChild
                >
                  <a
                    href={record.file_url}
                    download={record.file_name || record.title}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </a>
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}