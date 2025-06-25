/**
 * Medical Summaries TypeScript types
 */

export interface MedicalSummary {
  id: string;
  user_id: string;
  summary_text: string;
  conditions_identified: string[];
  medications_mentioned: string[];
  tests_performed: string[];
  patterns_identified: string[];
  risk_factors: string[];
  recommendations: string[];
  record_count: number;
  last_updated: string;
  created_at: string;
}

export interface MedicalSummaryFormData {
  summary_text: string;
  conditions_identified: string[];
  medications_mentioned: string[];
  tests_performed: string[];
  patterns_identified: string[];
  risk_factors: string[];
  recommendations: string[];
  record_count: number;
}

export interface AIAnalysisResult {
  summary: string;
  conditions: string[];
  medications: string[];
  tests: string[];
  patterns: string[];
  riskFactors: string[];
  recommendations: string[];
}

export interface TextExtractionResult {
  text: string;
  confidence: number;
  fileType: string;
  fileName: string;
}

export interface SummaryGenerationRequest {
  userId: string;
  recordIds: string[];
  forceRegenerate?: boolean;
}

export interface SummaryGenerationResponse {
  summary: MedicalSummary;
  processingTime: number;
  recordsProcessed: number;
  filesProcessed: number;
}

export interface SummaryFilters {
  dateFrom?: string;
  dateTo?: string;
  includeConditions?: boolean;
  includeMedications?: boolean;
  includeTests?: boolean;
  includePatterns?: boolean;
  includeRiskFactors?: boolean;
  includeRecommendations?: boolean;
}

export interface SummaryStats {
  totalSummaries: number;
  averageProcessingTime: number;
  totalRecordsProcessed: number;
  summariesByMonth: Record<string, number>;
  mostCommonConditions: Array<{ condition: string; count: number }>;
  mostCommonMedications: Array<{ medication: string; count: number }>;
  mostCommonTests: Array<{ test: string; count: number }>;
}

export interface FileProcessingStatus {
  fileId: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
  extractedText?: string;
}

export interface SummaryGenerationStatus {
  summaryId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  currentStep: string;
  filesProcessed: number;
  totalFiles: number;
  error?: string;
  result?: MedicalSummary;
}
