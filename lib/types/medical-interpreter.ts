// Medical Interpreter component types
export interface MedicalInterpretation {
  simpleExplanation: string;
  recommendedActions: string[];
  medicalAttentionIndicators: string[];
}

export interface InterpreterResult {
  interpretation: MedicalInterpretation;
  originalText: string;
  language: 'english' | 'pidgin';
  timestamp: Date;
}

export interface ExampleSnippet {
  id: string;
  title: string;
  text: string;
  type: 'prescription' | 'lab_result' | 'scan_summary';
}

export interface InterpreterState {
  inputText: string;
  selectedLanguage: 'english' | 'pidgin';
  isLoading: boolean;
  result: InterpreterResult | null;
  error: string | null;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
}