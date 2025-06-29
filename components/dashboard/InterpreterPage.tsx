"use client";
import React, { useEffect, useState } from "react";
import { InterpretationResult } from "@/lib/types/dashboard";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

export default function InterpreterPage() {
  const { user } = useAuthStore();
  const [state, setState] = useState({
    currentResult: null as InterpretationResult | null,
    isLoading: false,
    error: null as string | null,
  });

  const setResult = async (result: InterpretationResult | null) => {
    setState((prev) => {
      // Log result generation if there's a user and a result
      if (user && result) {
        LoggingService.logAction(user, LoggingService.actions.AI_INTERPRET, {
          language: result.language,
          document_type: result.documentType,
          content_length: result.originalText.length,
        }).catch((error) => {
          console.error("Failed to log AI interpretation:", error);
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
        page: "interpreter_page",
      }).catch((error) => {
        console.error("Failed to log page view:", error);
      });
    }
  }, [user]);

  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"></div>;
}
