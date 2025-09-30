import { useState, useCallback } from "react";
import { MedicalAnalysisResult } from "@/lib/services/ai-medical-interpretation";

interface AnalysisResponse {
  success: boolean;
  analysis: MedicalAnalysisResult & {
    id: string;
    processedAt: Date;
  };
  warnings?: Array<{
    type: string;
    message: string;
  }>;
  isExisting?: boolean;
}

interface AnalysisError {
  error: string;
  details?: string[];
  retryAfter?: number;
}

interface UseMedicalAnalysisReturn {
  analyzeDocument: (
    recordId: string,
    forceReanalysis?: boolean
  ) => Promise<AnalysisResponse>;
  getAnalysis: (recordId: string) => Promise<AnalysisResponse>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMedicalAnalysis(): UseMedicalAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const analyzeDocument = useCallback(
    async (
      recordId: string,
      forceReanalysis = false
    ): Promise<AnalysisResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/medical-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recordId,
            forceReanalysis,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorData = data as AnalysisError;

          if (response.status === 429) {
            throw new Error(
              `Rate limit exceeded. Please try again in ${
                errorData.retryAfter || 60
              } seconds.`
            );
          }

          if (response.status === 400 && errorData.details) {
            throw new Error(`Invalid request: ${errorData.details.join(", ")}`);
          }

          throw new Error(errorData.error || "Failed to analyze document");
        }

        return data as AnalysisResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getAnalysis = useCallback(
    async (recordId: string): Promise<AnalysisResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/medical-analysis?recordId=${recordId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorData = data as AnalysisError;
          throw new Error(errorData.error || "Failed to get analysis");
        }

        return data as AnalysisResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    analyzeDocument,
    getAnalysis,
    isLoading,
    error,
    clearError,
  };
}

// Helper hook for confidence-based UI decisions
export function useAnalysisConfidence() {
  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  }, []);

  const getConfidenceLabel = useCallback((confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  }, []);

  const getConfidenceDescription = useCallback((confidence: number) => {
    if (confidence >= 0.8) {
      return "The AI analysis is highly confident in these results.";
    }
    if (confidence >= 0.6) {
      return "The AI analysis has moderate confidence. Consider reviewing with a healthcare provider.";
    }
    return "The AI analysis has low confidence. Manual review is strongly recommended.";
  }, []);

  const shouldShowWarning = useCallback((confidence: number) => {
    return confidence < 0.8;
  }, []);

  return {
    getConfidenceColor,
    getConfidenceLabel,
    getConfidenceDescription,
    shouldShowWarning,
  };
}
