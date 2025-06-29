/**
 * Medical Records TypeScript types
 */

export interface MedicalRecord {
  id: string;
  user_id: string;
  title: string;
  type: "prescription" | "scan" | "lab_result" | "other";
  hospital_name: string;
  visit_date: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  notes?: string;
  text_content?: string;
  processing_status?: "idle" | "processing" | "complete" | "failed";
  processed_at?: string;
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordFormData {
  title: string;
  type: "prescription" | "scan" | "lab_result" | "other";
  hospital_name: string;
  visit_date: string;
  notes?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MedicalRecordFilters {
  searchTerm: string;
  type: string;
  hospital: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MedicalRecordStats {
  totalRecords: number;
  recordsByType: Record<string, number>;
  recordsByHospital: Record<string, number>;
  totalFileSize: number;
}
