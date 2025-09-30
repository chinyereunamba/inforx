"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Filter,
  Calendar,
  Hospital,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Clock,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { MedicalRecord } from "@/lib/types/medical-records";
import {
  SearchFilters,
  SearchResult,
  MedicalRecordsSearchService,
} from "@/lib/services/medical-records-search-service";
import { useAuthStore } from "@/lib/stores/auth-store";

interface MedicalRecordsSearchProps {
  onSearchResults: (results: SearchResult) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
}

const RECORD_TYPES = [
  { value: "prescription", label: "Prescription" },
  { value: "lab_result", label: "Lab Result" },
  { value: "scan", label: "Scan/Imaging" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

const PROCESSING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "title", label: "Title" },
  { value: "hospital", label: "Hospital" },
  { value: "relevance", label: "Relevance" },
];

export default function MedicalRecordsSearch({
  onSearchResults,
  onFiltersChange,
  initialFilters = {},
  className = "",
}: MedicalRecordsSearchProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || "");
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Load popular search terms on mount
  useEffect(() => {
    if (user) {
      MedicalRecordsSearchService.getPopularSearchTerms(user.id).then(
        setPopularTerms
      );
    }
  }, [user]);

  // Get search suggestions
  useEffect(() => {
    if (debouncedQuery.length > 2 && user) {
      MedicalRecordsSearchService.getSearchSuggestions(debouncedQuery, user.id)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, user]);

  // Perform search when query or filters change
  useEffect(() => {
    if (user) {
      performSearch();
    }
  }, [debouncedQuery, filters, user]);

  const performSearch = useCallback(async () => {
    if (!user) return;

    setIsSearching(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        query: debouncedQuery || undefined,
      };

      const results = await MedicalRecordsSearchService.searchRecords(
        searchFilters,
        user.id
      );

      onSearchResults(results);
      onFiltersChange(searchFilters);

      // Save search analytics
      if (debouncedQuery) {
        MedicalRecordsSearchService.saveSearchQuery(
          debouncedQuery,
          searchFilters,
          results.total,
          user.id
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      // Handle error - maybe show toast
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, filters, user, onSearchResults, onFiltersChange]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type?.length) count++;
    if (filters.hospitalName?.length) count++;
    if (filters.dateRange) count++;
    if (filters.tags?.length) count++;
    if (filters.hasFiles !== undefined) count++;
    if (filters.processingStatus?.length) count++;
    return count;
  }, [filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search medical records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="pl-10 pr-4"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}

                {/* Search Suggestions */}
                {showSuggestions &&
                  (suggestions.length > 0 || popularTerms.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-medium text-slate-500 mb-2">
                            Suggestions
                          </div>
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-2 py-1 hover:bg-slate-100 rounded text-sm"
                            >
                              <Search className="inline h-3 w-3 mr-2 text-slate-400" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {popularTerms.length > 0 && (
                        <div className="p-2 border-t border-slate-100">
                          <div className="text-xs font-medium text-slate-500 mb-2">
                            Popular Searches
                          </div>
                          {popularTerms.slice(0, 5).map((term, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(term)}
                              className="w-full text-left px-2 py-1 hover:bg-slate-100 rounded text-sm"
                            >
                              <Clock className="inline h-3 w-3 mr-2 text-slate-400" />
                              {term}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>

              {(searchQuery || activeFiltersCount > 0) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Record Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Record Type
                </label>
                <div className="space-y-2">
                  {RECORD_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={filters.type?.includes(type.value) || false}
                        onCheckedChange={(checked) => {
                          const currentTypes = filters.type || [];
                          if (checked) {
                            updateFilter("type", [...currentTypes, type.value]);
                          } else {
                            updateFilter(
                              "type",
                              currentTypes.filter((t) => t !== type.value)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`type-${type.value}`}
                        className="text-sm text-slate-700"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={
                      filters.dateRange?.start
                        ? filters.dateRange.start.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const startDate = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      updateFilter("dateRange", {
                        start: startDate,
                        end: filters.dateRange?.end,
                      });
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={
                      filters.dateRange?.end
                        ? filters.dateRange.end.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const endDate = e.target.value
                        ? new Date(e.target.value)
                        : undefined;
                      updateFilter("dateRange", {
                        start: filters.dateRange?.start,
                        end: endDate,
                      });
                    }}
                  />
                </div>
              </div>

              {/* Processing Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Processing Status
                </label>
                <div className="space-y-2">
                  {PROCESSING_STATUSES.map((status) => (
                    <div
                      key={status.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={
                          filters.processingStatus?.includes(status.value) ||
                          false
                        }
                        onCheckedChange={(checked) => {
                          const currentStatuses =
                            filters.processingStatus || [];
                          if (checked) {
                            updateFilter("processingStatus", [
                              ...currentStatuses,
                              status.value,
                            ]);
                          } else {
                            updateFilter(
                              "processingStatus",
                              currentStatuses.filter((s) => s !== status.value)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`status-${status.value}`}
                        className="text-sm text-slate-700"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Has Files Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  File Attachment
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-files"
                      checked={filters.hasFiles === true}
                      onCheckedChange={(checked) => {
                        updateFilter("hasFiles", checked ? true : undefined);
                      }}
                    />
                    <label
                      htmlFor="has-files"
                      className="text-sm text-slate-700"
                    >
                      Has attached files
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-files"
                      checked={filters.hasFiles === false}
                      onCheckedChange={(checked) => {
                        updateFilter("hasFiles", checked ? false : undefined);
                      }}
                    />
                    <label
                      htmlFor="no-files"
                      className="text-sm text-slate-700"
                    >
                      No attached files
                    </label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <div className="space-y-2">
                  <Select
                    value={filters.sortBy || "date"}
                    onValueChange={(value) =>
                      updateFilter("sortBy", value as SearchFilters["sortBy"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortOrder || "desc"}
                    onValueChange={(value) =>
                      updateFilter(
                        "sortOrder",
                        value as SearchFilters["sortOrder"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {filters.type?.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {RECORD_TYPES.find((t) => t.value === type)?.label}
                      <button
                        onClick={() =>
                          updateFilter(
                            "type",
                            filters.type?.filter((t) => t !== type)
                          )
                        }
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.dateRange && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      Date Range
                      <button
                        onClick={() => updateFilter("dateRange", undefined)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  {filters.hasFiles !== undefined && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {filters.hasFiles ? "Has Files" : "No Files"}
                      <button
                        onClick={() => updateFilter("hasFiles", undefined)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
