"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  CheckCircle,
  Loader2,
  RefreshCw,
  CloudOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileUploadProgress } from "@/components/dashboard/FileUploadProgress";
import EnhancedMedicalRecordUpload from "@/components/medical-records/EnhancedMedicalRecordUpload";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";
import { MedicalRecord } from "@/lib/types/medical-records";
import { FileUploadService } from "@/lib/services/file-upload-service";

export default function UploadQueuePage() {
  const [uploadedRecords, setUploadedRecords] = useState<MedicalRecord[]>([]);
  const [isStorageAvailable, setIsStorageAvailable] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Check if storage bucket is accessible
    const checkStorage = async () => {
      try {
        const available = await FileUploadService.checkStorageAccess();
        setIsStorageAvailable(available);
      } catch (error) {
        console.error("Storage access check failed:", error);
        setIsStorageAvailable(false);
      }
    };

    checkStorage();

    // Log page view when component mounts
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "upload_queue",
      }).catch(console.error);
    }
  }, [user]);

  const handleRecordAdded = (record: MedicalRecord) => {
    setUploadedRecords((prev) => [record, ...prev]);

    // Log the action
    if (user) {
      LoggingService.logAction(user, "record_created", {
        record_id: record.id,
        has_file: !!record.file_url,
        record_type: record.type,
      }).catch(console.error);
    }
  };

  const refreshStorageCheck = async () => {
    setIsRefreshing(true);
    try {
      const available = await FileUploadService.checkStorageAccess();
      setIsStorageAvailable(available);
    } catch (error) {
      console.error("Storage access check failed:", error);
      setIsStorageAvailable(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-noto mb-2">
          Upload Manager
        </h1>
        <p className="text-lg text-gray-600">
          Securely upload and manage your medical documents with enhanced
          processing.
        </p>
      </div>

      {/* Storage availability warning */}
      {!isStorageAvailable && (
        <Alert variant="destructive" className="mb-6">
          <CloudOff className="h-4 w-4" />
          <AlertDescription>
            Storage service is currently unavailable. Uploads may not work
            properly.{" "}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-red-800 underline"
              onClick={refreshStorageCheck}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Check again
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="md:col-span-5">
          <Card className="border border-gray-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Medical Record
              </CardTitle>
              <CardDescription>
                Upload prescriptions, lab results, or medical scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedMedicalRecordUpload
                onRecordAdded={handleRecordAdded}
                onUploadComplete={() => {
                  // This function is called when the upload is complete
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Uploads */}
        <div className="md:col-span-7">
          <Card className="border border-gray-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recent Uploads
              </CardTitle>
              <CardDescription>
                Your recently uploaded medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No uploads yet
                    </h3>
                    <p className="text-gray-600">
                      Your uploaded records will appear here
                    </p>
                  </div>
                ) : (
                  uploadedRecords.map((record) => (
                    <FileUploadProgress
                      key={record.id}
                      fileName={record.title}
                      fileSize={record.file_size}
                      fileType={record.file_type}
                      fileUrl={record.file_url}
                      uploadProgress={100}
                      processingProgress={100}
                      status="success"
                      onView={() => window.open(record.file_url, "_blank")}
                      onDownload={() => {
                        if (record.file_url) {
                          const a = document.createElement("a");
                          a.href = record.file_url;
                          a.download = record.file_name || record.title;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Upload Tips & Reminders
            </h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">1</span>
                </div>
                <span>
                  All files are securely encrypted and stored in compliance with
                  healthcare privacy standards
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">2</span>
                </div>
                <span>
                  Our AI can extract text from images and PDFs to help generate
                  summaries and analysis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">3</span>
                </div>
                <span>
                  Adding detailed hospital information helps organize your
                  medical history more effectively
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
