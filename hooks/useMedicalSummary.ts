import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  MedicalSummary,
  GenerateSummaryRequest,
} from "@/lib/types/medical-summaries";

export function useMedicalSummary() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("No authenticated user");
      }

      const response = await fetch("/api/medical-summary/latest", {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
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

      if (!user) {
        throw new Error("No authenticated user");
      }

      const requestBody: GenerateSummaryRequest = { recordIds };

      const response = await fetch("/api/medical-summary/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
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

  // Helper to get the access token
  const getAccessToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session");
    }
    return session.access_token;
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
