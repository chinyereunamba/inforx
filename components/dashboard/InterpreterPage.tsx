"use client";
import { useEffect } from "react";
import InterpreterInterface from "@/components/dashboard/InterpreterInterface";
import ResultsDisplay from "@/components/dashboard/ResultsDisplay";
import { InterpretationResult } from "@/lib/types/dashboard";
import React, { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

export default function InterpreterPage() {
  const { user } = useAuthStore();
  const [state, setState] = useState({
    currentResult: null as InterpretationResult | null,
    isLoading: false,
    error: null as string | null,
  });



  const setResult = (result: InterpretationResult | null) => {
    setState((prev) => {
      // Log result generation if there's a user and a result
      if (user && result) {
        LoggingService.logAction(user, LoggingService.actions.AI_INTERPRET, {
          language: result.language,
          document_type: result.documentType,
          content_length: result.originalText.length
        });
      }
      return { ...prev, currentResult: result };
    });
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };
  
  // Log page view on component mount
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "interpreter_page"
      });
    }
  }, [user]);
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <InterpreterInterface
        onResult={setResult}
        onError={setError}
        onLoading={setLoading}
        isLoading={state.isLoading}
        error={state.error}
      />
      <ResultsDisplay
        result={state.currentResult}
        isLoading={state.isLoading}
        error={state.error}
      />
    </div>
  );
}
