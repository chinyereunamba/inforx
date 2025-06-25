import {
  MedicalRecord,
  MedicalRecordFormData,
} from "@/lib/types/medical-records";

export interface MedicalRecordsFilters {
  type?: string;
  hospital?: string;
  search?: string;
}

export interface MedicalRecordsStats {
  totalRecords: number;
  recordsByType: Record<string, number>;
  recordsByHospital: Record<string, number>;
  totalFileSize: number;
  recordsByMonth: Record<string, number>;
  recentRecords: MedicalRecord[];
  topHospitals: Array<{ hospital: string; count: number }>;
  topTypes: Array<{ type: string; count: number }>;
  formattedTotalFileSize: string;
  averageFileSize: string;
  recordsWithFiles: number;
  recordsWithoutFiles: number;
}

class MedicalRecordsService {
  private baseUrl = "/api/medical-records";

  // Fetch all medical records with optional filters
  async getRecords(filters?: MedicalRecordsFilters): Promise<MedicalRecord[]> {
    const params = new URLSearchParams();

    if (filters?.type && filters.type !== "all") {
      params.append("type", filters.type);
    }
    if (filters?.hospital && filters.hospital !== "all") {
      params.append("hospital", filters.hospital);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const url = `${this.baseUrl}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch medical records");
    }

    const data = await response.json();
    return data.records;
  }

  // Get a specific medical record
  async getRecord(id: string): Promise<MedicalRecord> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch medical record");
    }

    const data = await response.json();
    return data.record;
  }

  // Create a new medical record
  async createRecord(
    formData: MedicalRecordFormData,
    file?: File
  ): Promise<MedicalRecord> {
    const data = new FormData();

    // Add form fields
    data.append("title", formData.title);
    data.append("type", formData.type);
    data.append("hospital_name", formData.hospital_name);
    data.append("visit_date", formData.visit_date);
    if (formData.notes) {
      data.append("notes", formData.notes);
    }

    // Add file if provided
    if (file) {
      data.append("file", file);
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create medical record");
    }

    const result = await response.json();
    return result.record;
  }

  // Update a medical record
  async updateRecord(
    id: string,
    updates: Partial<MedicalRecordFormData>
  ): Promise<MedicalRecord> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update medical record");
    }

    const data = await response.json();
    return data.record;
  }

  // Delete a medical record
  async deleteRecord(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete medical record");
    }
  }

  // Get medical records statistics
  async getStats(): Promise<MedicalRecordsStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch statistics");
    }

    return await response.json();
  }

  // Download a file from storage
  async downloadFile(fileUrl: string): Promise<Blob> {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    return await response.blob();
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper method to get file type icon
  getFileTypeIcon(fileType?: string): string {
    if (!fileType) return "📄";

    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📘";
    if (fileType.includes("image")) return "🖼️";

    return "📄";
  }

  // Helper method to validate file
  validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Only PDF, DOCX, PNG, JPG are allowed",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: "File size must be less than 10MB",
      };
    }

    return { isValid: true };
  }
}

// Export a singleton instance
export const medicalRecordsService = new MedicalRecordsService();
