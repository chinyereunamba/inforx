"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";
import { useMedicalRecords } from '@/hooks/useMedicalRecordsHook';
import {
  Upload,
  FileText,
  FolderOpen,
  Filter,
  Search,
  Pill,
  FileImage,
  FileCheck,
  X,
  Eye,
  Download,
  Calendar,
  Tag,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import EnhancedMedicalRecordUpload from "@/components/medical-records/EnhancedMedicalRecordUpload";
import { MedicalRecord } from "@/lib/types/medical-records";

export default function MedicalVaultPage() {
  const { user } = useAuthStore();
  const { records, loading, deleteRecord, refetch } = useMedicalRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  const [recentUploads, setRecentUploads] = useState<MedicalRecord[]>([]);

  // Filtered records based on search and filter type
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = filterType === 'all' || record.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, filterType]);

  useEffect(() => {
    if (user) {
      // Set recent uploads when records change
      const recentFiles = [...records]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      setRecentUploads(recentFiles);
      
      // Log page view
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "medical_vault",
      });
    }
  }, [user, records]);

  const handleRecordAdded = (newRecord: MedicalRecord) => {
    // No need to update local state as the store will handle it via Realtime
    // Just ensure we refresh the records list
    refetch();
  };

  const handleRecordDeleted = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      // No need to update local state as the store will handle it via Realtime
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const toggleUploadSection = () => {
    setIsUploadExpanded(!isUploadExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Filter records by type for each section
  const getRecordsByType = (type: string) => {
    return filteredRecords.filter((record) => record.type === type);
  };

  const prescriptions = getRecordsByType("prescription");
  const labResults = getRecordsByType("lab_result");
  const scans = getRecordsByType("scan");
  const others = getRecordsByType("other");

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 font-noto">
              My Medical Vault
            </h1>
            <p className="text-gray-600">
              Securely store and organize all your important medical documents
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Search is already handled by the filteredRecords memo
                  }
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full"
              />
            </div>
            <Button
              onClick={toggleUploadSection}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isUploadExpanded ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Close Upload
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Section - Expandable */}
        {isUploadExpanded && (
          <Card className="mb-8 border border-emerald-200 shadow-md overflow-hidden">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-emerald-700 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Medical Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EnhancedMedicalRecordUpload
                onRecordAdded={handleRecordAdded}
                onUploadComplete={() => {
                  setIsUploadExpanded(false);
                  refetch();
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-sm font-medium text-gray-700">Filter by:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className={
                filterType === "all"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              All
            </Button>
            <Button
              variant={filterType === "prescription" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("prescription")}
              className={
                filterType === "prescription"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              <Pill className="h-4 w-4 mr-1" />
              Prescriptions
            </Button>
            <Button
              variant={filterType === "lab_result" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("lab_result")}
              className={
                filterType === "lab_result"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Lab Results
            </Button>
            <Button
              variant={filterType === "scan" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("scan")}
              className={
                filterType === "scan"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              <FileImage className="h-4 w-4 mr-1" />
              Scans
            </Button>
            <Button
              variant={filterType === "other" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("other")}
              className={
                filterType === "other"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              <FileText className="h-4 w-4 mr-1" />
              Others
            </Button>
          </div>
        </div>

        {/* Recent Uploads Section */}
        {recentUploads.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-emerald-600 mr-2" />
              Recent Uploads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentUploads.map((record) => (
                <RecentUploadCard
                  key={record.id}
                  record={record}
                  formatDate={formatDate}
                  getTypeIcon={getTypeIcon}
                  getTypeLabel={getTypeLabel}
                  onDelete={() => handleRecordDeleted(record.id)}
                />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Loading your medical records...
              </p>
            </div>
          </div>
        ) : (
          <>
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FolderOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No medical records found
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by uploading your first medical document using the
                  upload button above.
                </p>
                <Button
                  onClick={() => setIsUploadExpanded(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Prescriptions Section */}
                {filterType === "all" && prescriptions.length > 0 && (
                  <RecordSection
                    title="Prescriptions"
                    icon={<Pill className="h-5 w-5 text-blue-500" />}
                    records={prescriptions}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    onDelete={handleRecordDeleted}
                  />
                )}

                {/* Lab Results Section */}
                {filterType === "all" && labResults.length > 0 && (
                  <RecordSection
                    title="Lab Results"
                    icon={<FileCheck className="h-5 w-5 text-amber-500" />}
                    records={labResults}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    onDelete={handleRecordDeleted}
                  />
                )}

                {/* Scans Section */}
                {filterType === "all" && scans.length > 0 && (
                  <RecordSection
                    title="Scans"
                    icon={<FileImage className="h-5 w-5 text-purple-500" />}
                    records={scans}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    onDelete={handleRecordDeleted}
                  />
                )}

                {/* Other Documents Section */}
                {filterType === "all" && others.length > 0 && (
                  <RecordSection
                    title="Other Documents"
                    icon={<FileText className="h-5 w-5 text-gray-500" />}
                    records={others}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    onDelete={handleRecordDeleted}
                  />
                )}

                {/* When filtered, show all matching records */}
                {filterType !== "all" && (
                  <RecordSection
                    title={`${getTypeLabel(filterType)} Records`}
                    icon={getTypeIcon(filterType)}
                    records={filteredRecords}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    onDelete={handleRecordDeleted}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Recent Upload Card Component
interface RecentUploadCardProps {
  record: MedicalRecord;
  formatDate: (date: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeLabel: (type: string) => string;
  onDelete: () => void;
}

function RecentUploadCard({
  record,
  formatDate,
  getTypeIcon,
  getTypeLabel,
  onDelete,
}: RecentUploadCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <Card className="border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(record.type)}
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(record.type)}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {record.file_url && (
              <>
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  title="View document"
                >
                  <Eye className="h-3.5 w-3.5 text-gray-600" />
                </a>
                <a
                  href={record.file_url}
                  download={record.file_name || record.title}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  title="Download document"
                >
                  <Download className="h-3.5 w-3.5 text-gray-600" />
                </a>
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors disabled:opacity-50"
              title="Delete document"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <h3
          className="font-medium text-gray-900 mb-1 truncate"
          title={record.title}
        >
          {record.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(record.visit_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Tag className="h-3 w-3" />
          <span className="truncate">{record.hospital_name}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Record Section Component
interface RecordSectionProps {
  title: string;
  icon: JSX.Element;
  records: MedicalRecord[];
  formatDate: (date: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeLabel: (type: string) => string;
  onDelete: (id: string) => void;
}

function RecordSection({
  title,
  icon,
  records,
  formatDate,
  getTypeIcon,
  getTypeLabel,
  onDelete,
}: RecordSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
        <Badge variant="outline" className="ml-2 text-xs">
          {records.length}
        </Badge>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            formatDate={formatDate}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
            onDelete={() => onDelete(record.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Record Card Component
interface RecordCardProps {
  record: MedicalRecord;
  formatDate: (date: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeLabel: (type: string) => string;
  onDelete: () => void;
}

function RecordCard({
  record,
  formatDate,
  getTypeIcon,
  getTypeLabel,
  onDelete,
}: RecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
          <Badge variant="outline" className="text-xs font-normal">
            {getTypeLabel(record.type)}
          </Badge>
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
                <span className="ml-1">
                  ({formatFileSize(record.file_size)})
                </span>
              )}
            </div>
          )}
        </div>

        {record.notes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">{record.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {record.file_url && (
            <>
              <Button variant="outline" size="sm" className="h-8" asChild>
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </a>
              </Button>

              <Button variant="outline" size="sm" className="h-8" asChild>
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

        {/* File Preview Modal (simplified) */}
        {showPreview && record.file_url && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{record.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                {record.file_type?.includes("image") ? (
                  <img
                    src={record.file_url}
                    alt={record.title}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p>Preview not available</p>
                    <a
                      href={record.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline mt-2 inline-block"
                    >
                      Open document in new tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}