import {
  MedicalSummary,
  SummaryGenerationRequest,
  SummaryGenerationResponse,
} from "@/lib/types/medical-summaries";

class MedicalSummariesService {
  private baseUrl = "/api/medical-summaries";

  // Get user's medical summaries
  async getSummaries(limit = 10, offset = 0): Promise<MedicalSummary[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch medical summaries");
    }

    const data = await response.json();
    return data.summaries;
  }

  // Get the latest medical summary
  async getLatestSummary(): Promise<MedicalSummary | null> {
    const summaries = await this.getSummaries(1, 0);
    return summaries.length > 0 ? summaries[0] : null;
  }

  // Generate new medical summary
  async generateSummary(
    request: SummaryGenerationRequest
  ): Promise<SummaryGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate medical summary");
    }

    return await response.json();
  }

  // Delete all user's summaries
  async deleteAllSummaries(): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete medical summaries");
    }
  }

  // Helper method to format summary date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Helper method to get summary status
  getSummaryStatus(summary: MedicalSummary): "recent" | "stale" | "old" {
    const lastUpdated = new Date(summary.last_updated);
    const hoursSinceUpdate =
      (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) {
      return "recent";
    } else if (hoursSinceUpdate < 168) {
      // 7 days
      return "stale";
    } else {
      return "old";
    }
  }

  // Helper method to get summary status color
  getSummaryStatusColor(status: "recent" | "stale" | "old"): string {
    switch (status) {
      case "recent":
        return "text-green-600 bg-green-50";
      case "stale":
        return "text-yellow-600 bg-yellow-50";
      case "old":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  // Helper method to truncate summary text
  truncateSummary(text: string, maxLength = 200): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  }

  // Helper method to count items in summary
  getSummaryStats(summary: MedicalSummary) {
    return {
      conditions: summary.conditions_identified?.length || 0,
      medications: summary.medications_mentioned?.length || 0,
      tests: summary.tests_performed?.length || 0,
      patterns: summary.patterns_identified?.length || 0,
      riskFactors: summary.risk_factors?.length || 0,
      recommendations: summary.recommendations?.length || 0,
    };
  }
}

// Export singleton instance
export const medicalSummariesService = new MedicalSummariesService();
