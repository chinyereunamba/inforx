"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InterpretationViewProps {
  recordId: string;
}

interface Interpretation {
  id: string;
  interpretation_text: string | null;
  processing_status: "complete" | "processing" | "failed";
  processing_error: string | null;
}

export default function InterpretationView({
  recordId,
}: InterpretationViewProps) {
  const [interpretation, setInterpretation] = useState<Interpretation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterpretation() {
      if (!recordId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/medical-records/${recordId}/interpretation`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch interpretation");
        }
        const data = await response.json();
        setInterpretation(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInterpretation();
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="font-medium">Generating AI Interpretation...</p>
        <p className="text-sm text-gray-500">
          Please wait a moment while we analyze the document.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <p className="font-medium text-red-700">Error</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!interpretation) {
    return null;
  }

  const renderContent = () => {
    switch (interpretation.processing_status) {
      case "complete":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {interpretation.interpretation_text ||
                "No interpretation available."}
            </p>
          </div>
        );
      case "processing":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="font-medium">Interpretation is still in progress.</p>
            <p className="text-sm text-gray-500">
              Please check back in a few moments.
            </p>
          </div>
        );
      case "failed":
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
            <p className="font-medium text-red-700">Interpretation Failed</p>
            <p className="text-sm text-red-600">
              {interpretation.processing_error || "An unknown error occurred."}
            </p>
          </div>
        );
      default:
        return <p>Unknown status.</p>;
    }
  };

  return (
    <div className="p-1">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-full">
          <BrainCircuit className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold">AI Interpretation</h3>
        <Badge
          variant={
            interpretation.processing_status === "complete"
              ? "default"
              : interpretation.processing_status === "failed"
              ? "destructive"
              : "outline"
          }
        >
          {interpretation.processing_status}
        </Badge>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border">{renderContent()}</div>
    </div>
  );
}
