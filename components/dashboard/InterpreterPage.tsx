"use client";
import InterpreterInterface from "@/components/dashboard/InterpreterInterface";
import ResultsDisplay from "@/components/dashboard/ResultsDisplay";
import { InterpretationResult } from "@/lib/types/dashboard";
import React, { useState } from "react";

export default function InterpreterPage() {
  const [state, setState] = useState({
    currentResult: null as InterpretationResult | null,
    isLoading: false,
    error: null as string | null,
  });

  const setResult = (result: InterpretationResult | null) => {
    setState((prev) => ({ ...prev, currentResult: result }));
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };
    
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
