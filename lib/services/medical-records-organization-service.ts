"use client";

export interface MedicalFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  recordIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkActionResult {
  success: boolean;
  message: string;
  affectedRecords: number;
  error?: string;
}

export class MedicalRecordsOrganizationService {
  /**
   * Get all folders for the current user
   */
  public static async getFolders(): Promise<MedicalFolder[]> {
    try {
      const response = await fetch("/api/medical-records/folders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const result = await response.json();
      return result.folders || [];
    } catch (error) {
      console.error("Folders fetch error:", error);
      throw error;
    }
  }

  /**
   * Create a new folder
   */
  public static async createFolder(
    folderData: Omit<
      MedicalFolder,
      "id" | "recordIds" | "createdAt" | "updatedAt"
    >
  ): Promise<MedicalFolder> {
    try {
      const response = await fetch("/api/medical-records/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create folder");
      }

      const result = await response.json();
      return result.folder;
    } catch (error) {
      console.error("Folder creation error:", error);
      throw error;
    }
  }

  /**
   * Update an existing folder
   */
  public static async updateFolder(
    folderId: string,
    updates: Partial<Pick<MedicalFolder, "name" | "description" | "color">>
  ): Promise<MedicalFolder> {
    try {
      const response = await fetch(`/api/medical-records/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update folder");
      }

      const result = await response.json();
      return result.folder;
    } catch (error) {
      console.error("Folder update error:", error);
      throw error;
    }
  }

  /**
   * Delete a folder
   */
  public static async deleteFolder(folderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/medical-records/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Folder deletion error:", error);
      throw error;
    }
  }

  /**
   * Move or copy records to a folder
   */
  public static async organizeRecords(
    recordIds: string[],
    targetFolderId: string | null,
    action: "move" | "copy" = "move"
  ): Promise<BulkActionResult> {
    try {
      const response = await fetch("/api/medical-records/organize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordIds,
          targetFolderId,
          action,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to organize records");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        affectedRecords: recordIds.length,
      };
    } catch (error) {
      console.error("Organization error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Bulk delete records
   */
  public static async bulkDeleteRecords(
    recordIds: string[]
  ): Promise<BulkActionResult> {
    try {
      const deletePromises = recordIds.map((recordId) =>
        fetch(`/api/medical-records/${recordId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failureCount = results.length - successCount;

      if (failureCount > 0) {
        return {
          success: false,
          message: `${successCount} records deleted, ${failureCount} failed`,
          affectedRecords: successCount,
          error: `${failureCount} deletions failed`,
        };
      }

      return {
        success: true,
        message: `${successCount} records deleted successfully`,
        affectedRecords: successCount,
      };
    } catch (error) {
      console.error("Bulk delete error:", error);
      return {
        success: false,
        message: "Bulk delete failed",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Bulk download records
   */
  public static async bulkDownloadRecords(
    recordIds: string[]
  ): Promise<BulkActionResult> {
    try {
      // Create a zip file with all record files
      const response = await fetch("/api/medical-records/bulk-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordIds }),
      });

      if (!response.ok) {
        throw new Error("Bulk download failed");
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-records-${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `${recordIds.length} records downloaded successfully`,
        affectedRecords: recordIds.length,
      };
    } catch (error) {
      console.error("Bulk download error:", error);
      return {
        success: false,
        message: "Bulk download failed",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Add tags to records
   */
  public static async bulkTagRecords(
    recordIds: string[],
    tags: string[]
  ): Promise<BulkActionResult> {
    try {
      const response = await fetch("/api/medical-records/bulk-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordIds,
          tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to tag records");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        affectedRecords: recordIds.length,
      };
    } catch (error) {
      console.error("Bulk tagging error:", error);
      return {
        success: false,
        message: "Bulk tagging failed",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Share records with others
   */
  public static async shareRecords(
    recordIds: string[],
    shareOptions: {
      email?: string;
      expiresAt?: Date;
      permissions: "view" | "download";
    }
  ): Promise<BulkActionResult> {
    try {
      const response = await fetch("/api/medical-records/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordIds,
          ...shareOptions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to share records");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        affectedRecords: recordIds.length,
      };
    } catch (error) {
      console.error("Share error:", error);
      return {
        success: false,
        message: "Sharing failed",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Auto-organize records based on content analysis
   */
  public static async autoOrganizeRecords(
    recordIds: string[]
  ): Promise<BulkActionResult> {
    try {
      const response = await fetch("/api/medical-records/auto-organize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Auto-organization failed");
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message,
        affectedRecords: result.organizedCount || 0,
      };
    } catch (error) {
      console.error("Auto-organization error:", error);
      return {
        success: false,
        message: "Auto-organization failed",
        affectedRecords: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get organization statistics
   */
  public static async getOrganizationStats(): Promise<{
    totalRecords: number;
    organizedRecords: number;
    totalFolders: number;
    organizationPercentage: number;
  }> {
    try {
      const response = await fetch("/api/medical-records/organization-stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch organization stats");
      }

      const result = await response.json();
      return result.stats;
    } catch (error) {
      console.error("Organization stats error:", error);
      return {
        totalRecords: 0,
        organizedRecords: 0,
        totalFolders: 0,
        organizationPercentage: 0,
      };
    }
  }

  /**
   * Suggest folder organization based on record content
   */
  public static async suggestOrganization(recordIds: string[]): Promise<{
    suggestions: Array<{
      folderName: string;
      recordIds: string[];
      reason: string;
      confidence: number;
    }>;
  }> {
    try {
      const response = await fetch(
        "/api/medical-records/organization-suggestions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recordIds }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get organization suggestions");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Organization suggestions error:", error);
      return { suggestions: [] };
    }
  }
}
