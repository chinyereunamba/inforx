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
  FileCheck as FileCheckIcon,
  Pill,
  AlertTriangle, 
  AlertCircle,
  Lightbulb,
  BookOpen,
  Check,
  Hospital,
  CheckSquare,
  Trash2,
  MoreVertical,
  BrainCircuit,
} from "lucide-react";
import { MedicalRecord } from "@/lib/types/medical-records";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InterpretationView from "./InterpretationView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecordCardProps {
  record: MedicalRecord;
  onDelete: (recordId: string) => void;
  onSelect?: (isSelected: boolean) => void;
  isSelected?: boolean;
}

export default function RecordCard({ 
  record, 
  onDelete, 
  onSelect, 
  isSelected,
}: RecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(!isSelected);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <Pill className="h-4 w-4 text-blue-500" />;
      case "scan":
        return <FileImage className="h-4 w-4 text-purple-500" />;
      case "lab_result":
        return <FileCheckIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      prescription: "Prescription",
      scan: "Scan",
      lab_result: "Lab Result",
      other: "Other",
    };
    return typeLabels[type] || "Other";
  };

  const getProcessingStatusBadge = () => {
    switch (record.processing_status) {
      case "complete":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700"
          >
            Processed
          </Badge>
        );
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const formatFileSize = (bytes: number) =>
    `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const onView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(record.file_url, "_blank");
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = record.file_url as string;
    a.download = record.file_name || record.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog>
    <Card 
        className={`border hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500"
            : "border-gray-200"
        }`}
        onClick={handleCardClick}
    >
      <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
                <div className="mt-1">
                  <CheckSquare
                    className={`h-5 w-5 ${
                      isSelected ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
              </div>
            )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
              {getTypeIcon(record.type)}
              <h3
                  className="font-semibold text-gray-900 truncate"
                title={record.title}
              >
                {record.title}
              </h3>
            </div>
          </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleActionClick}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleActionClick}>
                {record.file_url && (
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View File
                  </DropdownMenuItem>
                )}
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    AI Interpretation
                  </DropdownMenuItem>
                </DialogTrigger>
                {record.file_url && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(record.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2 text-sm text-gray-600 pl-8">
            <div className="flex items-center">
              <Hospital className="h-4 w-4 mr-2" />
              <span className="truncate">{record.hospital_name}</span>
              </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(record.visit_date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>AI Interpretation: {record.title}</DialogTitle>
        </DialogHeader>
        <InterpretationView recordId={record.id} />
      </DialogContent>
    </Dialog>
  );
}
