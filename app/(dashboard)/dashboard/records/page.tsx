"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useMedicalRecords } from "@/hooks/useMedicalRecordsHook";
import { LoggingService } from "@/lib/services/logging-service";
import {
  FilePlus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Hospital,
  FileText,
  BarChart3,
  Brain,
} from "lucide-react";
import MedicalRecordUpload from "@/components/medical-records/MedicalRecordUpload";
import MedicalRecordsList from "@/components/medical-records/MedicalRecordsList";
import { MedicalSummary } from "@/components/medical-records/MedicalSummary";
import { MedicalRecord } from "@/lib/types/medical-records";
import { MedicalSummary as MedicalSummaryType } from "@/lib/types/medical-summaries";

export default function MedicalRecordsPage() {
  const { user } = useAuthStore();
  const { records, loading, stats, deleteRecord, refetch } =
    useMedicalRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterHospital, setFilterHospital] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Filter records based on search term, type, and hospital
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by type
      const matchesType = filterType === "all" || record.type === filterType;

      // Filter by hospital
      const matchesHospital =
        filterHospital === "all" || record.hospital_name === filterHospital;

      return matchesSearch && matchesType && matchesHospital;
    });
  }, [records, searchTerm, filterType, filterHospital]);

  // Add new record to the list
  const addRecord = (newRecord: MedicalRecord) => {
    // No need to manually add the record - store will handle it via Realtime
    refetch();

    // Log the record was added
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.UPLOAD_FILE, {
        record_id: newRecord.id,
        title: newRecord.title,
        type: newRecord.type,
      });
    }
  };

  // Delete record from the list
  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      setSelectedRecordIds((prev) => prev.filter((id) => id !== recordId)); // Remove from selected records

      // Log record deletion
      if (user) {
        LoggingService.logAction(user, LoggingService.actions.DELETE_FILE, {
          record_id: recordId,
        });
      }
    } catch (error: any) {
      console.error("Error deleting record:", error);
      setError(error.message || "Failed to delete record");
    }
  };

  // Handle record selection
  const handleRecordSelection = (recordId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedRecordIds((prev) => [...prev, recordId]);
    } else {
      setSelectedRecordIds((prev) => prev.filter((id) => id !== recordId));
    }
  };

  // Handle summary generation
  const handleSummaryGenerated = (summary: MedicalSummaryType) => {
    setShowSummary(true);

    // Log summary generation
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.VIEW_SUMMARY, {
        summary_id: summary.id,
        record_count: summary.record_count,
      });
    }
  };

  // Handle search and filter changes
  const handleFiltersChange = () => {
    // No need for API call - filtering is done client-side with useMemo
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFiltersChange();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType, filterHospital]);

  useEffect(() => {
    if (user) {
      // Log page view
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "medical_records",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Please sign in to access your medical records.
          </p>
        </div>
      </div>
    );
  }

  // Get unique hospitals for filter
  const hospitals = Array.from(
    new Set(records.map((record) => record.hospital_name))
  );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* <div>
            <h1 className="text-2xl font-semibold font-noto text-gray-900">
              Medical Records
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and organize your medical documents securely
            </p>
          </div> */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {selectedRecordIds.length > 0 && (
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                {showSummary ? "Hide Summary" : "Show Summary"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="mx-6 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalRecords}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">With Files</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.recordsWithFiles}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.formattedTotalFileSize}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Hospital className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Hospitals</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats.recordsByHospital).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Column - Upload Form */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <FilePlus className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">
                Upload New Record
              </h2>
            </div>
            <MedicalRecordUpload
              onRecordAdded={addRecord}
              onUploadComplete={() => {
                refetch();
              }}
            />
          </div>

          {/* AI Summary Section */}
          {showSummary && (
            <div className="mt-6">
              <MedicalSummary
                selectedRecordIds={selectedRecordIds}
                onSummaryGenerated={handleSummaryGenerated}
              />
            </div>
          )}
        </div>

        {/* Right Column - Records List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter by:
                  </span>
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="prescription">Prescription</option>
                  <option value="scan">Scan</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filterHospital}
                  onChange={(e) => setFilterHospital(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Hospitals</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>

                <span className="text-sm text-gray-500">
                  {filteredRecords.length} records found
                </span>

                {selectedRecordIds.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedRecordIds.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* Records List */}
            <MedicalRecordsList
              records={filteredRecords}
              loading={loading}
              onRecordDeleted={(recordId) => handleDeleteRecord(recordId)}
              onRefresh={refetch}
              selectedRecordIds={selectedRecordIds}
              onRecordSelection={handleRecordSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
