"use client";

import { MedicalRecord } from "@/lib/types/medical-records";

export interface SearchFilters {
  query?: string;
  type?: string[];
  hospitalName?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  hasFiles?: boolean;
  processingStatus?: string[];
  sortBy?: "date" | "title" | "hospital" | "relevance";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  records: MedicalRecord[];
  total: number;
  facets: {
    types: { value: string; count: number }[];
    hospitals: { value: string; count: number }[];
    tags: { value: string; count: number }[];
    years: { value: number; count: number }[];
  };
  suggestions?: string[];
}

export interface SearchHighlight {
  field: string;
  highlights: string[];
}

export class MedicalRecordsSearchService {
  /**
   * Perform full-text search on medical records
   */
  public static async searchRecords(
    filters: SearchFilters,
    userId: string
  ): Promise<SearchResult> {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.query) {
        params.append("q", filters.query);
      }

      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((type) => params.append("type", type));
      }

      if (filters.hospitalName && filters.hospitalName.length > 0) {
        filters.hospitalName.forEach((hospital) =>
          params.append("hospital", hospital)
        );
      }

      if (filters.dateRange) {
        params.append(
          "start_date",
          filters.dateRange.start.toISOString().split("T")[0]
        );
        params.append(
          "end_date",
          filters.dateRange.end.toISOString().split("T")[0]
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append("tag", tag));
      }

      if (filters.hasFiles !== undefined) {
        params.append("has_files", filters.hasFiles.toString());
      }

      if (filters.processingStatus && filters.processingStatus.length > 0) {
        filters.processingStatus.forEach((status) =>
          params.append("status", status)
        );
      }

      if (filters.sortBy) {
        params.append("sort_by", filters.sortBy);
      }

      if (filters.sortOrder) {
        params.append("sort_order", filters.sortOrder);
      }

      if (filters.limit) {
        params.append("limit", filters.limit.toString());
      }

      if (filters.offset) {
        params.append("offset", filters.offset.toString());
      }

      // Make API request
      const response = await fetch(
        `/api/medical-records/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  public static async getSearchSuggestions(
    query: string,
    userId: string
  ): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/medical-records/suggestions?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.suggestions || [];
    } catch (error) {
      console.error("Suggestions error:", error);
      return [];
    }
  }

  /**
   * Client-side filtering for cached records
   */
  public static filterRecordsLocally(
    records: MedicalRecord[],
    filters: SearchFilters
  ): MedicalRecord[] {
    let filteredRecords = [...records];

    // Text search
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filteredRecords = filteredRecords.filter((record) => {
        const searchableText = [
          record.title,
          record.hospital_name,
          record.notes,
          record.text_content,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      filteredRecords = filteredRecords.filter((record) =>
        filters.type!.includes(record.type)
      );
    }

    // Hospital filter
    if (filters.hospitalName && filters.hospitalName.length > 0) {
      filteredRecords = filteredRecords.filter((record) =>
        filters.hospitalName!.some((hospital) =>
          record.hospital_name.toLowerCase().includes(hospital.toLowerCase())
        )
      );
    }

    // Date range filter
    if (filters.dateRange) {
      filteredRecords = filteredRecords.filter((record) => {
        const recordDate = new Date(record.visit_date);
        return (
          recordDate >= filters.dateRange!.start &&
          recordDate <= filters.dateRange!.end
        );
      });
    }

    // Has files filter
    if (filters.hasFiles !== undefined) {
      filteredRecords = filteredRecords.filter((record) =>
        filters.hasFiles ? !!record.file_url : !record.file_url
      );
    }

    // Processing status filter
    if (filters.processingStatus && filters.processingStatus.length > 0) {
      filteredRecords = filteredRecords.filter((record) =>
        filters.processingStatus!.includes(
          record.processing_status || "pending"
        )
      );
    }

    // Sort records
    if (filters.sortBy) {
      filteredRecords.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "date":
            comparison =
              new Date(a.visit_date).getTime() -
              new Date(b.visit_date).getTime();
            break;
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "hospital":
            comparison = a.hospital_name.localeCompare(b.hospital_name);
            break;
          case "relevance":
            // For relevance, we'd need more sophisticated scoring
            comparison = 0;
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return filteredRecords;
  }

  /**
   * Generate search facets from records
   */
  public static generateFacets(
    records: MedicalRecord[]
  ): SearchResult["facets"] {
    const types = new Map<string, number>();
    const hospitals = new Map<string, number>();
    const tags = new Map<string, number>();
    const years = new Map<number, number>();

    records.forEach((record) => {
      // Count types
      types.set(record.type, (types.get(record.type) || 0) + 1);

      // Count hospitals
      hospitals.set(
        record.hospital_name,
        (hospitals.get(record.hospital_name) || 0) + 1
      );

      // Count years
      const year = new Date(record.visit_date).getFullYear();
      years.set(year, (years.get(year) || 0) + 1);

      // Count tags (if available)
      // Note: This assumes tags are stored in the record, which may need to be added to the schema
      // if (record.tags) {
      //   record.tags.forEach(tag => {
      //     tags.set(tag, (tags.get(tag) || 0) + 1);
      //   });
      // }
    });

    return {
      types: Array.from(types.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      hospitals: Array.from(hospitals.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tags.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      years: Array.from(years.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.value - a.value),
    };
  }

  /**
   * Highlight search terms in text
   */
  public static highlightSearchTerms(
    text: string,
    searchTerms: string[],
    maxLength: number = 200
  ): string {
    if (!searchTerms.length || !text) return text;

    let highlightedText = text;

    // Create regex for all search terms
    const termsRegex = new RegExp(
      `(${searchTerms
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})`,
      "gi"
    );

    // Find the first match to center the excerpt around
    const match = text.match(termsRegex);
    if (match && match.index !== undefined) {
      const matchIndex = match.index;
      const start = Math.max(0, matchIndex - maxLength / 2);
      const end = Math.min(text.length, start + maxLength);

      highlightedText = text.substring(start, end);

      if (start > 0) highlightedText = "..." + highlightedText;
      if (end < text.length) highlightedText = highlightedText + "...";
    } else if (text.length > maxLength) {
      highlightedText = text.substring(0, maxLength) + "...";
    }

    // Apply highlighting
    highlightedText = highlightedText.replace(termsRegex, "<mark>$1</mark>");

    return highlightedText;
  }

  /**
   * Extract search terms from query
   */
  public static extractSearchTerms(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2) // Filter out very short terms
      .map((term) => term.replace(/[^\w]/g, "")) // Remove special characters
      .filter((term) => term.length > 0);
  }

  /**
   * Build search query for PostgreSQL full-text search
   */
  public static buildFullTextQuery(query: string): string {
    const terms = this.extractSearchTerms(query);

    if (terms.length === 0) return "";

    // Create a tsquery-compatible string
    // Use & for AND, | for OR, and :* for prefix matching
    return terms.map((term) => `${term}:*`).join(" & ");
  }

  /**
   * Get popular search terms
   */
  public static async getPopularSearchTerms(userId: string): Promise<string[]> {
    try {
      const response = await fetch("/api/medical-records/popular-searches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.terms || [];
    } catch (error) {
      console.error("Popular terms error:", error);
      return [];
    }
  }

  /**
   * Save search query for analytics
   */
  public static async saveSearchQuery(
    query: string,
    filters: SearchFilters,
    resultCount: number,
    userId: string
  ): Promise<void> {
    try {
      await fetch("/api/medical-records/search-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          filters,
          resultCount,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Search analytics error:", error);
      // Don't throw - this is not critical
    }
  }
}
