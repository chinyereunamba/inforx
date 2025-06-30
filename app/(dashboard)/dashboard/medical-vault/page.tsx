"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";
import { useMedicalRecords } from "@/hooks/useMedicalRecordsHook";
import {
  CheckSquare,
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
  Loader2,
  FileUp,
  LayoutGrid,
  CheckCircle,
  LayoutList,
  SortAsc,
  SortDesc,
  Trash2,
  AlertTriangle,
  FileQuestion,
  Brain,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import EnhancedMedicalRecordUpload from "@/components/medical-records/EnhancedMedicalRecordUpload";
import { FileUploadProgress } from "@/components/dashboard/FileUploadProgress";
import {
  MedicalRecord,
  MedicalRecordFormData,
} from "@/lib/types/medical-records";
import { FileUploadService } from "@/lib/services/file-upload-service";
import { TextExtractor } from "@/lib/utils/text-extraction"; // Import TextExtractor
import RecordCard from "@/components/medical-records/RecordCard";
import { MedicalSummary } from '@/components/medical-records/MedicalSummary';
import { toast } from 'sonner';

// Interface for active upload file
interface ActiveUpload {
  id: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  status: "uploading" | "processing" | "success" | "error";
  progress: number; // Overall progress (0-100)
  processingProgress: number; // Text extraction/AI processing progress (0-100)
  fileUrl?: string;
  error?: string;
  record?: MedicalRecord;
}

export default function MedicalVaultPage() {
  const { user } = useAuthStore();
  const { records, loading, deleteRecord, createRecord, stats, fetchStats } =
    useMedicalRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // State for selected records
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // State for active uploads
  const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicates if a form is being submitted from the dialog

  // For observing upload progress (not directly used for UI, but good practice for cleanup)
  const uploadObserverRef = useRef<IntersectionObserver | null>(null);

  // Filtered records based on search and filter type
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by type
      const matchesType = filterType === "all" || record.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, filterType]);

  // Sorted records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const dateA = new Date(a.visit_date).getTime();
      const dateB = new Date(b.visit_date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [filteredRecords, sortOrder]);

  // Effect to show/hide bulk actions based on selection
  useEffect(() => {
    setShowBulkActions(selectedRecordIds.length > 0);
    
    // Close summary panel when selection changes to empty
    if (selectedRecordIds.length === 0) {
      setShowSummary(false);
    }
  }, [selectedRecordIds]);

  // Categories for organizing records
  const recordsByType = useMemo(() => {
    const grouped: Record<string, MedicalRecord[]> = {
      prescription: [],
      lab_result: [],
      scan: [],
      other: [],
    };

    sortedRecords.forEach((record) => {
      grouped[record.type].push(record);
    });

    return grouped;
  }, [sortedRecords]);

  // Fetch stats on component mount and whenever records change
  useEffect(() => {
    fetchStats();
  }, [records, fetchStats]);

  useEffect(() => {
    if (user) {
      // Set up intersection observer for upload progress cards
      uploadObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Card is visible, keep it in view
              entry.target.classList.add("upload-card-visible");
            } else {
              // Card is not visible
              entry.target.classList.remove("upload-card-visible");
            }
          });
        },
        { threshold: 0.1 }
      );

      // Log page view
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "medical_vault",
      });
    }

    return () => {
      // Clean up observer
      if (uploadObserverRef.current) {
        uploadObserverRef.current.disconnect();
      }
    };
  }, [user]);

  // Handle file upload submission from the dialog
  const handleSubmitForm = async (
    formData: MedicalRecordFormData,
    file: File | null,
    extractedText: string | null
  ) => {
    if (!user) return;

    setIsSubmitting(true);

    // Create a unique ID for this upload
    const uploadId = `upload-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Add to active uploads with initial state
    const newUpload: ActiveUpload = {
      id: uploadId,
      fileName: file?.name || formData.title || "Medical Record",
      fileSize: file?.size,
      fileType: file?.type,
      status: "uploading",
      progress: 0,
      processingProgress: 0,
    };

    setActiveUploads((prev) => [...prev, newUpload]);
    setIsDialogOpen(false); // Close dialog immediately after submission

    try {
      let fileUrl: string | undefined;
      let finalFileName: string | undefined;
      let finalFileSize: number | undefined;
      let finalFileType: string | undefined;

      // If there's a file, upload it first
      if (file) {
        // Update status to uploading
        setActiveUploads((uploads) =>
          uploads.map((upload) =>
            upload.id === uploadId ? { ...upload, status: "uploading" } : upload
          )
        );

        // Upload the file
        const uploadResult = await FileUploadService.uploadFile(
          file,
          user,
          (progress) => {
            setActiveUploads((uploads) =>
              uploads.map((upload) =>
                upload.id === uploadId
                  ? { ...upload, progress: progress.percentage }
                  : upload
              )
            );
          }
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "File upload failed");
        }

        fileUrl = uploadResult.fileUrl;
        finalFileName = uploadResult.fileName;
        finalFileSize = uploadResult.fileSize;
        finalFileType = uploadResult.fileType;

        // Update status to processing (for AI interpretation/text extraction)
        setActiveUploads((uploads) =>
          uploads.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  status: "processing",
                  progress: 100, // File upload complete
                  fileUrl,
                }
              : upload
          )
        );
      }

      // Create the record in the database
      const recordDataToCreate: MedicalRecordFormData = {
        ...formData,
        notes: formData.notes || extractedText || undefined, // Use extracted text if no notes provided
      };

      const createdRecord = await createRecord(
        recordDataToCreate,
        file || undefined
      );

      // Update upload status to success
      setActiveUploads((uploads) =>
        uploads.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: "success",
                progress: 100,
                processingProgress: 100, // Assuming processing is complete once record is created
                record: createdRecord,
              }
            : upload
        )
      );

      // After 5 seconds, remove the success notification
      setTimeout(() => {
        setActiveUploads((uploads) =>
          uploads.filter((upload) => upload.id !== uploadId)
        );
      }, 5000);
    } catch (error) {
      console.error("Error creating record:", error);

      // Update upload status to error
      setActiveUploads((uploads) =>
        uploads.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to upload medical record",
              }
            : upload
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordDeleted = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      // Also remove from selected records if it was selected
      setSelectedRecordIds(prev => prev.filter(id => id !== recordId));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };
  
  // Handle record selection
  const toggleRecordSelection = (recordId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRecordIds(prev => [...prev, recordId]);
    } else {
      setSelectedRecordIds(prev => prev.filter(id => id !== recordId));
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRecordIds.length === 0) return;
    
    setConfirmingDelete(true);
  };
  
  // Confirm and execute bulk delete
  const confirmBulkDelete = async () => {
    try {
      // Create a copy to avoid state mutation during the operation
      const recordsToDelete = [...selectedRecordIds];
      
      // Show loading toast
      toast.loading(`Deleting ${recordsToDelete.length} records...`);
      
      // Delete each record
      for (const recordId of recordsToDelete) {
        await deleteRecord(recordId);
      }
      
      // Show success toast
      toast.success(`Successfully deleted ${recordsToDelete.length} records`);
      
      // Clear selection and close confirmation
      setSelectedRecordIds([]);
      setConfirmingDelete(false);
    } catch (error) {
      console.error("Error during bulk delete:", error);
      toast.error("An error occurred while deleting records");
    }
  };
  
  // Toggle all records selection
  const toggleSelectAll = () => {
    if (selectedRecordIds.length === sortedRecords.length) {
      // If all are selected, deselect all
      setSelectedRecordIds([]);
    } else {
      // Otherwise, select all
      setSelectedRecordIds(sortedRecords.map(record => record.id));
    }
  };
  
  // Handle generate summary click
  const handleGenerateSummary = () => {
    if (selectedRecordIds.length === 0) {
      toast.error("Please select at least one record for the summary");
      return;
    }
    
    setShowSummary(true);
  };
  
  // Handle summary generation completion
  const handleSummaryGenerated = () => {
    toast.success("Health summary generated successfully");
  };

  // Cancel an active upload (just removes from list for now)
  const handleCancelUpload = (uploadId: string) => {
    setActiveUploads((uploads) =>
      uploads.filter((upload) => upload.id !== uploadId)
    );
  };

  // Retry a failed upload (just removes from list for now, user can re-upload)
  const handleRetryUpload = (uploadId: string) => {
    setActiveUploads((uploads) =>
      uploads.filter((upload) => upload.id !== uploadId)
    );
    // In a real app, you might re-trigger the handleSubmitForm with the original data
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get type icon for records
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 font-noto">
              Medical Vault
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

            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Medical Document</DialogTitle>
                    <DialogDescription>
                      Add a medical record to your personal health vault.
                    </DialogDescription>
                  </DialogHeader>
                  <EnhancedMedicalRecordUpload
                    onSubmitForm={handleSubmitForm}
                    onClose={() => setIsDialogOpen(false)}
                    isSubmittingParent={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Upload Progress Cards */}
        {activeUploads.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileUp className="h-5 w-5 text-emerald-500" />
              Active Uploads
            </h2>
            <div className="space-y-3">
              {activeUploads.map((upload) => (
                <FileUploadProgress
                  key={upload.id}
                  fileName={upload.fileName}
                  fileSize={upload.fileSize}
                  fileType={upload.fileType}
                  fileUrl={upload.fileUrl}
                  uploadProgress={upload.progress}
                  processingProgress={upload.processingProgress}
                  status={upload.status}
                  error={upload.error}
                  onRetry={() => handleRetryUpload(upload.id)}
                  onCancel={() => handleCancelUpload(upload.id)}
                  onView={
                    upload.fileUrl
                      ? () => window.open(upload.fileUrl, "_blank")
                      : undefined
                  }
                  onDownload={
                    upload.fileUrl
                      ? () => {
                          const a = document.createElement("a");
                          a.href = upload.fileUrl as string;
                          a.download = upload.fileName;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Bulk Actions Floating Bar */}
        {showBulkActions && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full shadow-xl border border-gray-200 py-2 px-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm text-gray-700">
                {selectedRecordIds.length} {selectedRecordIds.length === 1 ? 'record' : 'records'} selected
              </span>
              
              <div className="h-4 border-r border-gray-300"></div>
              
              <Button
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                onClick={handleGenerateSummary}
              >
                <Brain className="h-4 w-4 mr-1" />
                Generate Summary
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => setSelectedRecordIds([])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        {confirmingDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex items-start mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete {selectedRecordIds.length} {selectedRecordIds.length === 1 ? 'record' : 'records'}? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmBulkDelete}
                >
                  Delete {selectedRecordIds.length} {selectedRecordIds.length === 1 ? 'record' : 'records'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-3 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-semibold">
                  {stats.totalRecords}
                </div>
                <div className="text-xs text-slate-500">Total Records</div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-emerald-100 rounded-full p-3 mb-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-semibold">
                  {stats.recordsWithFiles}
                </div>
                <div className="text-xs text-slate-500">With Attachments</div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-purple-100 rounded-full p-3 mb-3">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-semibold">
                  {
                    Array.from(new Set(records.map((r) => r.hospital_name)))
                      .length
                  }
                </div>
                <div className="text-xs text-slate-500">Hospitals</div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="bg-amber-100 rounded-full p-3 mb-3">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-2xl font-semibold">{records.length}</div>
                <div className="text-xs text-slate-500">Documents</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Medical Summary Section - Only shown when records are selected for summary */}
        {showSummary && selectedRecordIds.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Health Summary</h2>
                    <p className="text-sm text-gray-600">
                      Generated from {selectedRecordIds.length} selected record{selectedRecordIds.length !== 1 && 's'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSummary(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <MedicalSummary 
                selectedRecordIds={selectedRecordIds}
                onSummaryGenerated={handleSummaryGenerated}
              />
            </div>
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              {records.filter((r) => r.type === "prescription").length > 0 && (
                <span className="ml-1 text-xs">
                  {records.filter((r) => r.type === "prescription").length}
                </span>
              )}
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
              {records.filter((r) => r.type === "lab_result").length > 0 && (
                <span className="ml-1 text-xs">
                  {records.filter((r) => r.type === "lab_result").length}
                </span>
              )}
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
              {records.filter((r) => r.type === "scan").length > 0 && (
                <span className="ml-1 text-xs">
                  {records.filter((r) => r.type === "scan").length}
                </span>
              )}
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
              {records.filter((r) => r.type === "other").length > 0 && (
                <span className="ml-1 text-xs">
                  {records.filter((r) => r.type === "other").length}
                </span>
              )}
            </Button>
          </div>

          <div className="flex gap-3">
            {/* View Mode Switcher */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-sky-50 text-sky-600" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-sky-50 text-sky-600" : ""}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Order Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              className="gap-2"
            >
              {sortOrder === "newest" ? (
                <>
                  <SortDesc className="h-4 w-4" />
                  Newest
                </>
              ) : (
                <>
                  <SortAsc className="h-4 w-4" />
                  Oldest
                </>
              )}
            </Button>
          </div>
        </div>

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
            {sortedRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FolderOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No medical records found
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by uploading your first medical record using the upload
                  button above.
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Grid View */}
                {viewMode === "grid" &&
                  (filterType === "all" ? (
                    // Show by categories when "All" is selected
                    Object.entries(recordsByType).map(([type, typeRecords]) =>
                      typeRecords.length > 0 ? (
                        <div key={type}>
                          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            {getTypeIcon(type)}
                            <span>{getTypeLabel(type)}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {typeRecords.length}
                            </Badge>
                          </h2>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {typeRecords.map((record) => (
                              <RecordCard
                                key={record.id}
                                record={record}
                                onDelete={() => handleRecordDeleted(record.id)}
                                onSelect={(isSelected) => toggleRecordSelection(record.id, isSelected)}
                                isSelected={selectedRecordIds.includes(record.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null
                    )
                  ) : (
                    // When filtering by type, show all matching records
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {getTypeIcon(filterType)}
                        <span>{getTypeLabel(filterType)} Records</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {sortedRecords.length}
                        </Badge>
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedRecords.map((record) => (
                          <RecordCard
                            key={record.id}
                            record={record}
                            onDelete={() => handleRecordDeleted(record.id)}
                            onSelect={(isSelected) => toggleRecordSelection(record.id, isSelected)}
                            isSelected={selectedRecordIds.includes(record.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr className="group">
                            <th className="pl-6 pr-3 py-3 text-left">
                              <div 
                                className="flex items-center cursor-pointer"
                                onClick={toggleSelectAll}
                              >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                  selectedRecordIds.length === sortedRecords.length && sortedRecords.length > 0
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300 group-hover:border-blue-300'
                                }`}>
                                  {selectedRecordIds.length === sortedRecords.length && sortedRecords.length > 0 && 
                                    <Check className="h-3 w-3 text-white" />
                                  }
                                </div>
                              </div>
                            </th>
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
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedRecords.map((record, index) => (
                            <tr
                              key={record.id}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } ${
                                selectedRecordIds.includes(record.id) ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="pl-6 pr-3 py-4">
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => toggleRecordSelection(
                                    record.id, 
                                    !selectedRecordIds.includes(record.id)
                                  )}
                                >
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                    selectedRecordIds.includes(record.id)
                                      ? 'bg-blue-500 border-blue-500' 
                                      : 'border-gray-300 hover:border-blue-300'
                                  }`}>
                                    {selectedRecordIds.includes(record.id) && 
                                      <Check className="h-3 w-3 text-white" />
                                    }
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {getTypeIcon(record.type)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.title}
                                    </div>
                                    {record.file_name && (
                                      <div className="text-xs text-gray-500">
                                        {record.file_name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="text-xs">
                                  {getTypeLabel(record.type)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.hospital_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(record.visit_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  {record.file_url && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            record.file_url,
                                            "_blank"
                                          );
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const a = document.createElement("a");
                                          a.href = record.file_url as string;
                                          a.download =
                                            record.file_name || record.title;
                                          document.body.appendChild(a);
                                          a.click();
                                          document.body.removeChild(a);
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Download className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRecordDeleted(record.id);
                                    }}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}