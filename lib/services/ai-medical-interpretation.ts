import { z } from "zod";

// Types for AI analysis results
export interface MedicalAnalysisResult {
  summary: string;
  extractedData: {
    medications: Medication[];
    labResults: LabResult[];
    diagnoses: string[];
    recommendations: string[];
  };
  riskFactors: RiskFactor[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  aiModel: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
}

export interface LabResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  severity?: "normal" | "mild" | "moderate" | "severe";
  explanation?: string;
}

export interface RiskFactor {
  factor: string;
  severity: "low" | "medium" | "high";
  description: string;
}

// Validation schemas
const MedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
});

const LabResultSchema = z.object({
  testName: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  isAbnormal: z.boolean(),
  severity: z.enum(["normal", "mild", "moderate", "severe"]).optional(),
  explanation: z.string().optional(),
});

const RiskFactorSchema = z.object({
  factor: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string(),
});

const MedicalAnalysisSchema = z.object({
  summary: z.string(),
  extractedData: z.object({
    medications: z.array(MedicationSchema),
    labResults: z.array(LabResultSchema),
    diagnoses: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  riskFactors: z.array(RiskFactorSchema),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
});

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class AIRateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = "AIRateLimitError";
  }
}

export class AIServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AIServiceError";
  }
}

export class MedicalAIService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly rateLimitPerMinute: number;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.model = "anthropic/claude-3-haiku";
    this.maxRetries = 3;
    this.rateLimitPerMinute = 10;

    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
  }

  /**
   * Check rate limit for a user
   */
  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const key = `ai_rate_limit:${userId}`;
    const limit = rateLimitStore.get(key);

    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute
      return;
    }

    if (limit.count >= this.rateLimitPerMinute) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      throw new AIRateLimitError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }

    limit.count++;
  }

  /**
   * Generate medical prompt based on document type
   */
  private generatePrompt(
    documentType:
      | "prescription"
      | "lab_result"
      | "scan"
      | "consultation"
      | "other",
    textContent: string
  ): string {
    const basePrompt = `You are a medical AI assistant specialized in analyzing medical documents for patients in Nigeria. 
Your task is to analyze the provided medical document and extract structured information.

IMPORTANT: You must respond with a valid JSON object that matches this exact structure:
{
  "summary": "A clear, patient-friendly explanation of the document",
  "extractedData": {
    "medications": [
      {
        "name": "medication name",
        "dosage": "dosage amount",
        "frequency": "how often to take",
        "duration": "how long to take (optional)",
        "instructions": "special instructions (optional)",
        "sideEffects": ["list of side effects (optional)"],
        "interactions": ["drug interactions (optional)"]
      }
    ],
    "labResults": [
      {
        "testName": "name of the test",
        "value": "test result value",
        "unit": "unit of measurement (optional)",
        "referenceRange": "normal range (optional)",
        "isAbnormal": true/false,
        "severity": "normal/mild/moderate/severe (optional)",
        "explanation": "what this result means (optional)"
      }
    ],
    "diagnoses": ["list of diagnoses or conditions mentioned"],
    "recommendations": ["list of recommendations or next steps"]
  },
  "riskFactors": [
    {
      "factor": "risk factor name",
      "severity": "low/medium/high",
      "description": "explanation of the risk"
    }
  ],
  "urgencyLevel": "low/medium/high/critical",
  "confidence": 0.85
}

Guidelines:
- Extract ALL medications with complete dosage information
- Identify abnormal lab values and explain their significance
- Provide clear, actionable recommendations
- Use Nigerian medical context and terminology when relevant
- Be conservative with urgency levels - only use "critical" for life-threatening situations
- Confidence should reflect how certain you are about the analysis (0.0 to 1.0)
- If information is unclear or missing, indicate this in the summary`;

    const typeSpecificPrompts = {
      prescription: `
Focus on:
- Extracting all prescribed medications with exact dosages and frequencies
- Identifying potential drug interactions
- Providing clear medication instructions
- Highlighting any special precautions or side effects`,

      lab_result: `
Focus on:
- Extracting all test results with values and reference ranges
- Identifying abnormal values and their clinical significance
- Explaining what abnormal results might indicate
- Recommending follow-up actions for abnormal results`,

      scan: `
Focus on:
- Extracting key findings from imaging reports
- Identifying any abnormalities or areas of concern
- Explaining the clinical significance of findings
- Recommending appropriate follow-up or specialist referrals`,

      consultation: `
Focus on:
- Extracting diagnoses and treatment plans
- Identifying prescribed medications and instructions
- Noting any follow-up appointments or tests recommended
- Highlighting important patient education points`,

      other: `
Focus on:
- Extracting any relevant medical information
- Identifying key findings or recommendations
- Providing appropriate context for the document type`,
    };

    return `${basePrompt}

${typeSpecificPrompts[documentType]}

Document to analyze:
"""
${textContent}
"""

Respond with valid JSON only:`;
  }

  /**
   * Make API call to AI service with retry logic
   */
  private async makeAIRequest(prompt: string, attempt = 1): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "https://inforx.org",
          "X-Title": "InfoRx Medical AI",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1, // Low temperature for consistent medical analysis
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new AIRateLimitError("AI service rate limit exceeded", 60);
        }
        throw new AIServiceError(
          `AI service error: ${response.status} ${response.statusText}`,
          response.status.toString()
        );
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new AIServiceError("Invalid response from AI service");
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (
        error instanceof AIRateLimitError ||
        error instanceof AIServiceError
      ) {
        throw error;
      }

      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeAIRequest(prompt, attempt + 1);
      }

      throw new AIServiceError(
        `Failed to get AI response after ${this.maxRetries} attempts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse and validate AI response
   */
  private parseAIResponse(response: string): MedicalAnalysisResult {
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      // Validate the structure
      const validated = MedicalAnalysisSchema.parse(parsed);

      return {
        ...validated,
        aiModel: this.model,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AIServiceError(
          `Invalid AI response structure: ${error.errors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      throw new AIServiceError(
        `Failed to parse AI response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Analyze medical document
   */
  async analyzeMedicalDocument(
    userId: string,
    documentType:
      | "prescription"
      | "lab_result"
      | "scan"
      | "consultation"
      | "other",
    textContent: string
  ): Promise<MedicalAnalysisResult> {
    // Check rate limit
    this.checkRateLimit(userId);

    // Validate input
    if (!textContent || textContent.trim().length < 10) {
      throw new AIServiceError("Document content is too short or empty");
    }

    // Generate prompt
    const prompt = this.generatePrompt(documentType, textContent);

    // Make AI request
    const response = await this.makeAIRequest(prompt);

    // Parse and validate response
    let analysis = this.parseAIResponse(response);

    // Apply fallback confidence if not provided or invalid
    if (
      !analysis.confidence ||
      analysis.confidence < 0 ||
      analysis.confidence > 1
    ) {
      analysis.confidence = 0.7; // Default confidence
    }

    // Enhance analysis with medical data processing
    const { validateAndEnhanceMedicalData } = await import(
      "@/lib/utils/medical-data-processing"
    );
    analysis = validateAndEnhanceMedicalData(analysis, textContent);

    return analysis;
  }

  /**
   * Get confidence threshold recommendations
   */
  getConfidenceThreshold(): { minimum: number; recommended: number } {
    return {
      minimum: 0.6,
      recommended: 0.8,
    };
  }

  /**
   * Check if analysis meets confidence threshold
   */
  meetsConfidenceThreshold(
    analysis: MedicalAnalysisResult,
    threshold = 0.6
  ): boolean {
    return analysis.confidence >= threshold;
  }
}

// Export singleton instance
export const medicalAIService = new MedicalAIService();
