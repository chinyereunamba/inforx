import {
  AIAnalysisResult,
  MedicalSummary,
} from "@/lib/types/medical-summaries";

/**
 * AI Medical Summary Service
 * Uses OpenRouter or similar AI APIs to generate medical summaries
 */

export class AIMedicalSummaryService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = "https://openrouter.ai/api/v1";
  }

  /**
   * Generate medical summary from extracted text
   */
  async generateSummary(
    extractedTexts: string[],
    recordMetadata: Array<{
      title: string;
      type: string;
      hospital: string;
      visitDate: string;
      notes?: string;
    }>
  ): Promise<AIAnalysisResult> {
    try {
      // Combine all extracted texts
      const combinedText = this.combineTexts(extractedTexts, recordMetadata);

      // Generate AI analysis
      const analysis = await this.analyzeWithAI(combinedText);

      return analysis;
    } catch (error) {
      console.error("AI summary generation error:", error);
      throw new Error("Failed to generate medical summary");
    }
  }

  /**
   * Combine extracted texts with metadata
   */
  private combineTexts(
    texts: string[],
    metadata: Array<{
      title: string;
      type: string;
      hospital: string;
      visitDate: string;
      notes?: string;
    }>
  ): string {
    let combined = "MEDICAL RECORDS SUMMARY\n\n";

    // Add metadata for each record
    metadata.forEach((record, index) => {
      combined += `RECORD ${index + 1}:\n`;
      combined += `Title: ${record.title}\n`;
      combined += `Type: ${record.type}\n`;
      combined += `Hospital: ${record.hospital}\n`;
      combined += `Visit Date: ${record.visitDate}\n`;
      if (record.notes) {
        combined += `Notes: ${record.notes}\n`;
      }
      combined += "\n";
    });

    // Add extracted text content
    texts.forEach((text, index) => {
      combined += `DOCUMENT ${index + 1} CONTENT:\n`;
      combined += text;
      combined += "\n\n";
    });

    return combined;
  }

  /**
   * Analyze medical content with AI
   */
  private async analyzeWithAI(
    medicalContent: string
  ): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(medicalContent);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "InfoRx Medical Summary",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-h",
          messages: [
            {
              role: "system",
              content:
                "You are a medical AI assistant that analyzes medical records and provides clear, structured summaries. Focus on identifying key medical information, conditions, medications, tests, patterns, and recommendations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `AI API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("No response from AI service");
      }

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error("AI API error:", error);

      // Fallback: generate a basic summary
      return this.generateFallbackSummary(medicalContent);
    }
  }

  /**
   * Build the analysis prompt for AI
   */
  private buildAnalysisPrompt(medicalContent: string): string {
    return `Please analyze the following medical records and provide a comprehensive summary in the exact JSON format specified below.

MEDICAL RECORDS:
${medicalContent}

Please provide your analysis in the following JSON format:
{
  "summary": "A clear, plain-language summary of the patient's medical history, conditions, and key findings",
  "conditions": ["List of identified medical conditions or diagnoses"],
  "medications": ["List of medications mentioned or prescribed"],
  "tests": ["List of medical tests, procedures, or scans performed"],
  "patterns": ["Recurring symptoms, patterns, or trends identified"],
  "riskFactors": ["Identified risk factors or concerning findings"],
  "recommendations": ["Medical recommendations, follow-up needs, or action items"]
}

Guidelines:
- Be thorough but concise
- Use plain language that patients can understand
- Focus on actionable information
- Identify patterns across multiple records
- Highlight important findings and recommendations
- Ensure all arrays are properly formatted as JSON arrays
- If no information is found for a category, use an empty array

Please respond with ONLY the JSON object, no additional text.`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string): AIAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || "No summary available",
        conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
        medications: Array.isArray(parsed.medications)
          ? parsed.medications
          : [],
        tests: Array.isArray(parsed.tests) ? parsed.tests : [],
        patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
        riskFactors: Array.isArray(parsed.riskFactors)
          ? parsed.riskFactors
          : [],
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : [],
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Failed to parse AI analysis response");
    }
  }

  /**
   * Generate fallback summary when AI is unavailable
   */
  private generateFallbackSummary(medicalContent: string): AIAnalysisResult {
    // Simple keyword extraction as fallback
    const text = medicalContent.toLowerCase();

    const conditions = this.extractKeywords(text, [
      "diabetes",
      "hypertension",
      "asthma",
      "arthritis",
      "cancer",
      "heart disease",
      "depression",
      "anxiety",
      "obesity",
      "high blood pressure",
      "cholesterol",
    ]);

    const medications = this.extractKeywords(text, [
      "aspirin",
      "ibuprofen",
      "acetaminophen",
      "insulin",
      "metformin",
      "lisinopril",
      "atorvastatin",
      "amoxicillin",
      "prednisone",
    ]);

    const tests = this.extractKeywords(text, [
      "blood test",
      "x-ray",
      "mri",
      "ct scan",
      "ultrasound",
      "ecg",
      "ekg",
      "urinalysis",
      "biopsy",
      "colonoscopy",
      "mammogram",
    ]);

    return {
      summary: `Medical records analysis completed. Found ${conditions.length} conditions, ${medications.length} medications, and ${tests.length} tests mentioned across your records.`,
      conditions,
      medications,
      tests,
      patterns: ["Analysis patterns not available"],
      riskFactors: ["Risk factor analysis not available"],
      recommendations: [
        "Please consult with your healthcare provider for personalized recommendations.",
      ],
    };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string, keywords: string[]): string[] {
    return keywords.filter((keyword) => text.includes(keyword));
  }

  /**
   * Validate API configuration
   */
  validateConfig(): { isValid: boolean; error?: string } {
    if (!this.apiKey) {
      return {
        isValid: false,
        error: "OpenRouter API key not configured",
      };
    }

    return { isValid: true };
  }

  /**
   * Test AI service connectivity
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const aiMedicalSummaryService = new AIMedicalSummaryService();
