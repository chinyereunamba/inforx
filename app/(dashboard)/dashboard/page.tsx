"use client";
import InterpreterInterface from "@/components/dashboard/InterpreterInterface";
import ResultsDisplay from "@/components/dashboard/ResultsDisplay";
import { InterpreterResult } from "@/lib/types/medical-interpreter";
import { use, useState } from "react";

export default function DashboardPage() {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    currentResult: null,
  });
  const [result, setResult] = useState<InterpreterResult | null>();
  const [error, setError] = useState<string | null>();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="lg:w-2/5 bg-white border-r border-gray-200 flex flex-col">
        <InterpreterInterface
          onResult={setResult}
          onLoading={setLoading}
          onError={setError}
          isLoading={state.isLoading}
          error={state.error}
        />
      </div>

      <div className="flex-1 bg-gray-50 flex flex-col">
        <ResultsDisplay
          result={state.currentResult}
          isLoading={state.isLoading}
          error={state.error}
        />
      </div>
    </>
  );
}
