// Dashboard-specific types and interfaces
export interface DashboardState {
  activeTab: string;
  sidebarOpen: boolean;
  currentResult: InterpretationResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface InterpreterState {
  inputText: string;
  documentType: DocumentType;
  language: 'english' | 'pidgin';
  uploadedFile: File | null;
}

export interface InterpretationResult {
  id: string;
  originalText: string;
  documentType: DocumentType;
  language: 'english' | 'pidgin';
  interpretation: MedicalInterpretation;
  timestamp: Date;
  uploadedFile?: File | null;
}

export interface MedicalInterpretation {
  simpleExplanation: string;
  recommendedActions: string[];
  medicalAttentionIndicators: string[];
}

export type DocumentType = 'prescription' | 'lab_report' | 'medical_scan' | 'clinical_notes';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

// File upload types
export interface FileUploadState {
  file: File | null;
  progress: number;
  isUploading: boolean;
  error: string | null;
}

// Results display types
export interface ResultSection {
  id: string;
  title: string;
  content: string | string[];
  icon: any;
  color: 'blue' | 'yellow' | 'red';
}