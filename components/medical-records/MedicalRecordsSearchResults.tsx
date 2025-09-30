"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  FileText,
  Calendar,
  Hospital,
  Eye,
  Download,
  Share,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MedicalRecord } from "@/lib/types/medical-records";
import {
  SearchResult,
  MedicalRecordsSearchService,
} from "@/lib/services/medical-records-search-service";
import { format } from "date-fns";

interface MedicalRecordsSearchResultsProps {
  searchResults: SearchResult;
  onRecordSelect: (record: MedicalRecord) => void;
  onRecordAction: (action: string, record: MedicalRecord) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  className?: string;
}

type ViewMode = "list" | "grid";

export default function MedicalRecordsSearchResults({
  searchResults,
  onRecordSelect,
  onRecordAction,
  onLoadMore,
  isLoading = false,
  searchQuery = "",
  className = "",
}: MedicalRecordsSearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );

  // Extract search terms for highlighting
  const searchTerms = useMemo(() => {
    return MedicalRecordsSearchService.extractSearchTerms(searchQuery);
  }, [searchQuery]);

  // Toggle record selection
  const toggleRecordSelection = useCallback((recordId: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRecords(new Set());
  }, []);

  // Get record type icon and color
  const getRecordTypeInfo = useCallback((type: string) => {
    switch (type) {
      case "prescription":
        return { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" };
      case "lab_result":
        return { icon: FileText, color: "text-green-600", bg: "bg-green-100" };
      case "scan":
        return {
          icon: FileText,
          color: "text-purple-600",
          bg: "bg-purple-100",
        };
      case "consultation":
        return {
          icon: FileText,
          color: "text-orange-600",
          bg: "bg-orange-100",
        };
      default:
        return { icon: FileText, color: "text-gray-600", bg: "bg-gray-100" };
    }
  }, []);

  // Highlight search terms in text
  const highlightText = useCallback(
    (text: string, maxLength: number = 150) => {
      if (!searchTerms.length) {
        return text.length > maxLength
          ? text.substring(0, maxLength) + "..."
          : text;
      }

      const highlighted = MedicalRecordsSearchService.highlightSearchTerms(
        text,
        searchTerms,
        maxLength
      );

      return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    },
    [searchTerms]
  );

  // Render record in list view
  const renderListRecord = useCallback(
    (record: MedicalRecord) => {
      const typeInfo = getRecordTypeInfo(record.type);
      const TypeIcon = typeInfo.icon;

      return (
        <Card
          key={record.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onRecordSelect(record)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Record Icon */}
              <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
              </div>

              {/* Record Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {highlightText(record.title)}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Hospital className="h-4 w-4" />
                        <span>{highlightText(record.hospital_name, 50)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(record.visit_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {record.type.replace("_", " ")}
                      </Badge>

                      {record.file_url && (
                        <Badge variant="secondary" className="text-xs">
                          Has File
                        </Badge>
                      )}

                      {record.processing_status && (
                        <Badge
                          variant={
                            record.processing_status === "completed"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {record.processing_status}
                        </Badge>
                      )}
                    </div>

                    {/* Notes/Content Preview */}
                    {(record.notes || record.text_content) && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {highlightText(
                          record.notes || record.text_content || "",
                          200
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordAction("view", record);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {record.file_url && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onRecordAction("download", record);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordAction("share", record);
                        }}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
    [getRecordTypeInfo, highlightText, onRecordSelect, onRecordAction]
  );

  // Render record in grid view
  const renderGridRecord = useCallback(
    (record: MedicalRecord) => {
      const typeInfo = getRecordTypeInfo(record.type);
      const TypeIcon = typeInfo.icon;

      return (
        <Card
          key={record.id}
          className="hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => onRecordSelect(record)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecordAction("view", record);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  {record.file_url && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordAction("download", record);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardTitle className="text-base line-clamp-2">
              {highlightText(record.title, 60)}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                <div className="flex items-center gap-1 mb-1">
                  <Hospital className="h-3 w-3" />
                  <span className="truncate">{record.hospital_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(record.visit_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {record.type.replace("_", " ")}
                </Badge>
                {record.file_url && (
                  <Badge variant="secondary" className="text-xs">
                    File
                  </Badge>
                )}
              </div>

              {(record.notes || record.text_content) && (
                <p className="text-xs text-slate-600 line-clamp-3">
                  {highlightText(
                    record.notes || record.text_content || "",
                    100
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    },
    [getRecordTypeInfo, highlightText, onRecordSelect, onRecordAction]
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Search className="h-8 w-8 mx-auto mb-4 text-slate-400 animate-pulse" />
            <p className="text-slate-600">Searching medical records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Search Results
          </h2>
          <p className="text-sm text-slate-600">
            {searchResults.total} record{searchResults.total !== 1 ? "s" : ""}{" "}
            found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Facets */}
      {(searchResults.facets.types.length > 0 ||
        searchResults.facets.hospitals.length > 0 ||
        searchResults.facets.years.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Facets */}
              {searchResults.facets.types.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Type
                  </h4>
                  <div className="space-y-1">
                    {searchResults.facets.types.slice(0, 5).map((facet) => (
                      <div
                        key={facet.value}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {facet.value.replace("_", " ")}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {facet.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital Facets */}
              {searchResults.facets.hospitals.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Hospital
                  </h4>
                  <div className="space-y-1">
                    {searchResults.facets.hospitals.slice(0, 5).map((facet) => (
                      <div
                        key={facet.value}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600 truncate">
                          {facet.value}
                        </span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {facet.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Year Facets */}
              {searchResults.facets.years.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Year
                  </h4>
                  <div className="space-y-1">
                    {searchResults.facets.years.slice(0, 5).map((facet) => (
                      <div
                        key={facet.value}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600">{facet.value}</span>
                        <Badge variant="secondary" className="text-xs">
                          {facet.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchResults.records.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No records found
              </h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              {searchResults.suggestions &&
                searchResults.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Did you mean:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchResults.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {searchResults.records.map((record) =>
            viewMode === "grid"
              ? renderGridRecord(record)
              : renderListRecord(record)
          )}
        </div>
      )}

      {/* Load More */}
      {onLoadMore && searchResults.pagination?.hasMore && (
        <div className="text-center">
          <Button onClick={onLoadMore} variant="outline">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
