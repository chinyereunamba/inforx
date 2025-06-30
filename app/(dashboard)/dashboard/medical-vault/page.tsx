"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Loader2,
  FileUp,
  LayoutGrid,
  CheckCircle,
  LayoutList,
  SortAsc,
  SortDesc
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
  DialogTrigger
} from "@/components/ui/dialog";
import EnhancedMedicalRecordUpload from "@/components/medical-records/EnhancedMedicalRecordUpload";
import { FileUploadProgress } from "@/components/dashboard/FileUploadProgress";
import { MedicalRecord, MedicalRecordFormData } from "@/lib/types/medical-records";
import RecordCard from "@/components/medical-records/RecordCard";
import { FileUploadService } from "@/lib/services/file-upload-service";
import { FileUploadService } from "@/lib/services/file-upload-service";

// Interface for active upload file
interface ActiveUpload {
  id: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  processingProgress: number;
  fileUrl?: string;
  error?: string;
  record?: MedicalRecord;
}

export default function MedicalVaultPage() {
  const { user } = useAuthStore();
  const { records, loading, deleteRecord, refetch, createRecord } = useMedicalRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // State for active uploads
  const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for expanded records
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  
  // For observing upload progress
  const uploadObserverRef = useRef<IntersectionObserver | null>(null);

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

  // Sorted records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const dateA = new Date(a.visit_date).getTime();
      const dateB = new Date(b.visit_date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [filteredRecords, sortOrder]);

  // Categories for organizing records
  const recordsByType = useMemo(() => {
    const grouped: Record<string, MedicalRecord[]> = {
      prescription: [],
      lab_result: [],
      scan: [],
      other: []
    };
    
    sortedRecords.forEach(record => {
      grouped[record.type].push(record);
    });
    
    return grouped;
  }, [sortedRecords]);
  
  // Stats for the dashboard
  const stats = useMemo(() => {
    return {
      totalRecords: records.length,
      withFiles: records.filter(r => r.file_url).length,
      hospitals: [...new Set(records.map(r => r.hospital_name))].length,
      typeCounts: {
        prescription: records.filter(r => r.type === 'prescription').length,
        lab_result: records.filter(r => r.type === 'lab_result').length,
        scan: records.filter(r => r.type === 'scan').length,
        other: records.filter(r => r.type === 'other').length
      }
    };
  }, [records]);

  useEffect(() => {
    if (user) {
      // Set up intersection observer for upload progress cards
      uploadObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Card is visible, keep it in view
              entry.target.classList.add('upload-card-visible');
            } else {
              // Card is not visible
              entry.target.classList.remove('upload-card-visible');
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

  // Handle file upload submission
  const handleSubmitForm = async (
    formData: MedicalRecordFormData, 
    file: File | null,
    extractedText: string | null
  ) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a unique ID for this upload
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Add to active uploads with initial state
      const newUpload: ActiveUpload = {
        id: uploadId,
        fileName: file?.name || "Medical Record",
        fileSize: file?.size,
        fileType: file?.type,
        status: "uploading",
        progress: 0,
        processingProgress: 0
      };
      
      setActiveUploads(prev => [...prev, newUpload]);
      setIsDialogOpen(false); // Close dialog immediately after submission
      
      // Create the record
      try {
        // Update upload progress as file uploads
        const onUploadProgress = (progress: { percentage: number }) => {
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { ...upload, progress: progress.percentage } 
                : upload
            )
          );
        };
        
        // Process the upload
        let fileUrl: string | undefined;
        
        // If there's a file, upload it first
        if (file) {
          // Update status to uploading
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { ...upload, status: "uploading" } 
                : upload
            )
          );
          
          // Upload the file
          const uploadResult = await FileUploadService.uploadFile(file, user, onUploadProgress);
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "File upload failed");
          }
          
          fileUrl = uploadResult.fileUrl;
          
          // Update status to processing
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { 
                    ...upload, 
                    status: "processing", 
                    progress: 100,
                    fileUrl
                  } 
                : upload
            )
          );
          
          // Simulate processing progress (in a real app, this would be actual processing)
          const processingInterval = setInterval(() => {
            setActiveUploads(uploads => {
              const upload = uploads.find(u => u.id === uploadId);
              if (!upload) {
                clearInterval(processingInterval);
                return uploads;
              }
              
              const newProgress = upload.processingProgress + 10;
              if (newProgress >= 100) {
                clearInterval(processingInterval);
              }
              
              return uploads.map(u => 
                u.id === uploadId 
                  ? { ...u, processingProgress: Math.min(newProgress, 100) } 
                  : u
              );
            });
          }, 200);
        }
        
        // Update form with extracted text if available
        const updatedFormData = {
          ...formData,
          notes: formData.notes || extractedText || undefined
        };
        
        // Create the record
        const newRecord = await createRecord(updatedFormData, file);
        
        // Update upload status to success
        setActiveUploads(uploads => 
          uploads.map(upload => 
            upload.id === uploadId 
              ? { 
                  ...upload, 
                  status: "success", 
                  progress: 100, 
                  processingProgress: 100,
                  record: newRecord
                } 
              : upload
          )
        );
        
        // After 5 seconds, remove the success notification
        setTimeout(() => {
          setActiveUploads(uploads => uploads.filter(upload => upload.id !== uploadId));
        }, 5000);
        
      } catch (error) {
        console.error("Error creating record:", error);
        
        // Update upload status to error
        setActiveUploads(uploads => 
          uploads.map(upload => 
            upload.id === uploadId 
              ? { 
                  ...upload, 
                  status: "error", 
                  error: error instanceof Error ? error.message : "Failed to upload medical record"
                } 
              : upload
          )
        );
      }
      
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitForm = async (
    formData: MedicalRecordFormData, 
    file: File | null,
    extractedText: string | null
  ) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a unique ID for this upload
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Add to active uploads with initial state
      const newUpload: ActiveUpload = {
        id: uploadId,
        fileName: file?.name || "Medical Record",
        fileSize: file?.size,
        fileType: file?.type,
        status: "uploading",
        progress: 0,
        processingProgress: 0
      };
      
      setActiveUploads(prev => [...prev, newUpload]);
      setIsDialogOpen(false); // Close dialog immediately after submission
      
      // Create the record
      try {
        // Update upload progress as file uploads
        const onUploadProgress = (progress: { percentage: number }) => {
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { ...upload, progress: progress.percentage } 
                : upload
            )
          );
        };
        
        // Process the upload
        let fileUrl: string | undefined;
        
        // If there's a file, upload it first
        if (file) {
          // Update status to uploading
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { ...upload, status: "uploading" } 
                : upload
            )
          );
          
          // Upload the file
          const uploadResult = await FileUploadService.uploadFile(file, user, onUploadProgress);
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "File upload failed");
          }
          
          fileUrl = uploadResult.fileUrl;
          
          // Update status to processing
          setActiveUploads(uploads => 
            uploads.map(upload => 
              upload.id === uploadId 
                ? { 
                    ...upload, 
                    status: "processing", 
                    progress: 100,
                    fileUrl
                  } 
                : upload
            )
          );
          
          // Simulate processing progress (in a real app, this would be actual processing)
          const processingInterval = setInterval(() => {
            setActiveUploads(uploads => {
              const upload = uploads.find(u => u.id === uploadId);
              if (!upload) {
                clearInterval(processingInterval);
                return uploads;
              }
              
              const newProgress = upload.processingProgress + 10;
              if (newProgress >= 100) {
                clearInterval(processingInterval);
              }
              
              return uploads.map(u => 
                u.id === uploadId 
                  ? { ...u, processingProgress: Math.min(newProgress, 100) } 
                  : u
              );
            });
          }, 200);
        }
        
        // Update form with extracted text if available
        const updatedFormData = {
          ...formData,
          notes: formData.notes || extractedText || undefined
        };
        
        // Create the record
        const newRecord = await createRecord(updatedFormData, file);
        
        // Update upload status to success
        setActiveUploads(uploads => 
          uploads.map(upload => 
            upload.id === uploadId 
              ? { 
                  ...upload, 
                  status: "success", 
                  progress: 100, 
                  processingProgress: 100,
                  record: newRecord
                } 
              : upload
          )
        );
        
        // After 5 seconds, remove the success notification
        setTimeout(() => {
          setActiveUploads(uploads => uploads.filter(upload => upload.id !== uploadId));
        }, 5000);
        
      } catch (error) {
        console.error("Error creating record:", error);
        
        // Update upload status to error
        setActiveUploads(uploads => 
          uploads.map(upload => 
            upload.id === uploadId 
              ? { 
                  ...upload, 
                  status: "error", 
                  error: error instanceof Error ? error.message : "Failed to upload medical record"
                } 
              : upload
          )
        );
      }
      
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordDeleted = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };
  
  // Cancel an active upload
  const handleCancelUpload = (uploadId: string) => {
    setActiveUploads(uploads => uploads.filter(upload => upload.id !== uploadId));
  };
  
  // Retry a failed upload
  const handleRetryUpload = (uploadId: string) => {
    // In a real implementation, this would restart the upload
    // For now, we'll just remove it from the list
    setActiveUploads(uploads => uploads.filter(upload => upload.id !== uploadId));
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
  
  // Toggle expanded state for record details
  const toggleExpandRecord = (recordId: string) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
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
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
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
                  onView={upload.fileUrl ? () => window.open(upload.fileUrl, "_blank") : undefined}
                  onDownload={upload.fileUrl ? 
                    () => {
                      const a = document.createElement("a");
                      a.href = upload.fileUrl as string;
                      a.download = upload.fileName;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-semibold">{stats.totalRecords}</div>
              <div className="text-xs text-slate-500">Total Records</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-emerald-100 rounded-full p-3 mb-3">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-semibold">{stats.withFiles}</div>
              <div className="text-xs text-slate-500">With Attachments</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-3 mb-3">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-semibold">{stats.hospitals}</div>
              <div className="text-xs text-slate-500">Hospitals</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-amber-100 rounded-full p-3 mb-3">
                <FileCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-semibold">{Object.values(stats.typeCounts).reduce((a, b) => a + b, 0)}</div>
              <div className="text-xs text-slate-500">Documents</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className={filterType === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              All
            </Button>
            <Button
              variant={filterType === "prescription" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("prescription")}
              className={filterType === "prescription" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <Pill className="h-4 w-4 mr-1" />
              Prescriptions
              {stats.typeCounts.prescription > 0 && (
                <span className="ml-1 text-xs">{stats.typeCounts.prescription}</span>
              )}
            </Button>
            <Button
              variant={filterType === "lab_result" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("lab_result")}
              className={filterType === "lab_result" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Lab Results
              {stats.typeCounts.lab_result > 0 && (
                <span className="ml-1 text-xs">{stats.typeCounts.lab_result}</span>
              )}
            </Button>
            <Button
              variant={filterType === "scan" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("scan")}
              className={filterType === "scan" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <FileImage className="h-4 w-4 mr-1" />
              Scans
              {stats.typeCounts.scan > 0 && (
                <span className="ml-1 text-xs">{stats.typeCounts.scan}</span>
              )}
            </Button>
            <Button
              variant={filterType === "other" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("other")}
              className={filterType === "other" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <FileText className="h-4 w-4 mr-1" />
              Others
              {stats.typeCounts.other > 0 && (
                <span className="ml-1 text-xs">{stats.typeCounts.other}</span>
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
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
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
                  Start by uploading your first medical record using the upload button above.
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
                {viewMode === "grid" && (
                  filterType === "all" ? (
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
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}
                
                {/* List View */}
                {viewMode === "list" && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedRecords.map((record, index) => (
                            <tr 
                              key={record.id} 
                              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                              onClick={() => toggleExpandRecord(record.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {getTypeIcon(record.type)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{record.title}</div>
                                    {record.file_name && <div className="text-xs text-gray-500">{record.file_name}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="text-xs">{getTypeLabel(record.type)}</Badge>
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
                                          window.open(record.file_url, "_blank");
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
                                          a.download = record.file_name || record.title;
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