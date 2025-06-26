import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  MedicalSummary,
  GenerateSummaryRequest,
} from "@/lib/types/medical-summaries";

export function useMedicalSummary() {
  const supabase = createClient();
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/medical-summary/latest", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch summary");
      }

      setSummary(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching medical summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (recordIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const requestBody: GenerateSummaryRequest = { recordIds };

      const response = await fetch("/api/medical-summary/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate summary");
      }

      setSummary(result.summary);
      return result.summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error generating medical summary:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    fetchLatestSummary,
    generateSummary,
  };
}
