import { LabResult } from "@/lib/services/ai-medical-interpretation";
import {
  extractNumericValue,
  parseReferenceRange,
  isLabResultAbnormal,
  getLabResultSeverity,
} from "@/lib/utils/medical-data-processing";

/**
 * Comprehensive lab result analysis and interpretation service
 */

// Nigerian lab reference ranges and normal values
const NIGERIAN_LAB_REFERENCE_RANGES = {
  // Complete Blood Count (CBC)
  hemoglobin: {
    male: { min: 13.5, max: 17.5, unit: "g/dL" },
    female: { min: 12.0, max: 15.5, unit: "g/dL" },
    description: "Protein in red blood cells that carries oxygen",
  },
  hematocrit: {
    male: { min: 41, max: 53, unit: "%" },
    female: { min: 36, max: 46, unit: "%" },
    description: "Percentage of blood volume occupied by red blood cells",
  },
  white_blood_cells: {
    all: { min: 4.0, max: 11.0, unit: "×10³/μL" },
    description: "Cells that fight infection and disease",
  },
  platelets: {
    all: { min: 150, max: 450, unit: "×10³/μL" },
    description: "Cells that help blood clot",
  },
  red_blood_cells: {
    male: { min: 4.7, max: 6.1, unit: "×10⁶/μL" },
    female: { min: 4.2, max: 5.4, unit: "×10⁶/μL" },
    description: "Cells that carry oxygen throughout the body",
  },

  // Blood Chemistry
  glucose_fasting: {
    all: { min: 70, max: 100, unit: "mg/dL" },
    description: "Blood sugar level after fasting",
  },
  glucose_random: {
    all: { min: 70, max: 140, unit: "mg/dL" },
    description: "Blood sugar level at any time",
  },
  hba1c: {
    all: { min: 4.0, max: 5.6, unit: "%" },
    description: "Average blood sugar over 2-3 months",
  },
  total_cholesterol: {
    all: { min: 0, max: 200, unit: "mg/dL" },
    description: "Total amount of cholesterol in blood",
  },
  ldl_cholesterol: {
    all: { min: 0, max: 100, unit: "mg/dL" },
    description: "Bad cholesterol that can clog arteries",
  },
  hdl_cholesterol: {
    male: { min: 40, max: 999, unit: "mg/dL" },
    female: { min: 50, max: 999, unit: "mg/dL" },
    description: "Good cholesterol that protects against heart disease",
  },
  triglycerides: {
    all: { min: 0, max: 150, unit: "mg/dL" },
    description: "Type of fat in blood",
  },

  // Kidney Function
  creatinine: {
    male: { min: 0.7, max: 1.3, unit: "mg/dL" },
    female: { min: 0.6, max: 1.1, unit: "mg/dL" },
    description: "Waste product filtered by kidneys",
  },
  blood_urea_nitrogen: {
    all: { min: 7, max: 20, unit: "mg/dL" },
    description: "Waste product filtered by kidneys",
  },
  uric_acid: {
    male: { min: 3.4, max: 7.0, unit: "mg/dL" },
    female: { min: 2.4, max: 6.0, unit: "mg/dL" },
    description: "Waste product that can cause gout if elevated",
  },

  // Liver Function
  alt: {
    male: { min: 10, max: 40, unit: "U/L" },
    female: { min: 7, max: 35, unit: "U/L" },
    description: "Enzyme that indicates liver health",
  },
  ast: {
    all: { min: 10, max: 40, unit: "U/L" },
    description: "Enzyme found in liver and other organs",
  },
  alkaline_phosphatase: {
    all: { min: 44, max: 147, unit: "U/L" },
    description: "Enzyme that indicates liver or bone problems",
  },
  total_bilirubin: {
    all: { min: 0.3, max: 1.2, unit: "mg/dL" },
    description: "Waste product from red blood cell breakdown",
  },

  // Thyroid Function
  tsh: {
    all: { min: 0.4, max: 4.0, unit: "mIU/L" },
    description: "Hormone that regulates thyroid function",
  },
  t3: {
    all: { min: 80, max: 200, unit: "ng/dL" },
    description: "Active thyroid hormone",
  },
  t4: {
    all: { min: 5.1, max: 14.1, unit: "μg/dL" },
    description: "Main thyroid hormone",
  },

  // Electrolytes
  sodium: {
    all: { min: 136, max: 145, unit: "mEq/L" },
    description: "Electrolyte that maintains fluid balance",
  },
  potassium: {
    all: { min: 3.5, max: 5.1, unit: "mEq/L" },
    description: "Electrolyte important for heart and muscle function",
  },
  chloride: {
    all: { min: 98, max: 107, unit: "mEq/L" },
    description: "Electrolyte that helps maintain acid-base balance",
  },

  // Cardiac Markers
  troponin_i: {
    all: { min: 0, max: 0.04, unit: "ng/mL" },
    description: "Protein released during heart muscle damage",
  },
  ck_mb: {
    all: { min: 0, max: 6.3, unit: "ng/mL" },
    description: "Enzyme released during heart muscle damage",
  },

  // Inflammatory Markers
  esr: {
    male: { min: 0, max: 15, unit: "mm/hr" },
    female: { min: 0, max: 20, unit: "mm/hr" },
    description: "Marker of inflammation in the body",
  },
  crp: {
    all: { min: 0, max: 3.0, unit: "mg/L" },
    description: "Protein that indicates inflammation",
  },
};

// Critical values that require immediate attention
const CRITICAL_VALUES = {
  glucose_fasting: { low: 50, high: 400 },
  glucose_random: { low: 50, high: 400 },
  potassium: { low: 2.5, high: 6.5 },
  sodium: { low: 120, high: 160 },
  creatinine: { low: 0, high: 5.0 },
  hemoglobin: { low: 7.0, high: 20.0 },
  platelets: { low: 50, high: 1000 },
  troponin_i: { low: 0, high: 0.1 },
  total_bilirubin: { low: 0, high: 10.0 },
};

export interface LabResultAnalysis {
  results: EnhancedLabResult[];
  abnormalResults: EnhancedLabResult[];
  criticalResults: EnhancedLabResult[];
  trendAnalysis: TrendAnalysis[];
  healthInsights: HealthInsight[];
  recommendations: string[];
  overallAssessment: {
    status:
      | "normal"
      | "mild_abnormal"
      | "moderate_abnormal"
      | "severe_abnormal"
      | "critical";
    summary: string;
    urgencyLevel: "low" | "medium" | "high" | "critical";
  };
}

export interface EnhancedLabResult extends LabResult {
  normalRange?: { min: number; max: number; unit: string };
  percentileDeviation?: number;
  clinicalSignificance?: string;
  possibleCauses?: string[];
  followUpRecommendations?: string[];
  isCritical?: boolean;
  trendDirection?: "improving" | "worsening" | "stable" | "unknown";
  category?: string;
}

export interface TrendAnalysis {
  testName: string;
  values: Array<{ date: string; value: number; isAbnormal: boolean }>;
  trend: "improving" | "worsening" | "stable";
  trendPercentage: number;
  interpretation: string;
}

export interface HealthInsight {
  category: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  relatedTests: string[];
  recommendations: string[];
}

export class LabResultAnalysisService {
  /**
   * Analyze lab results and provide comprehensive interpretation
   */
  static analyzeLabResults(
    results: LabResult[],
    patientGender?: "male" | "female",
    previousResults?: Array<{ date: string; results: LabResult[] }>
  ): LabResultAnalysis {
    const enhancedResults = this.enhanceLabResults(results, patientGender);
    const abnormalResults = enhancedResults.filter(
      (result) => result.isAbnormal
    );
    const criticalResults = enhancedResults.filter(
      (result) => result.isCritical
    );
    const trendAnalysis = previousResults
      ? this.analyzeTrends(enhancedResults, previousResults)
      : [];
    const healthInsights = this.generateHealthInsights(enhancedResults);
    const recommendations = this.generateRecommendations(
      enhancedResults,
      criticalResults
    );
    const overallAssessment = this.assessOverallStatus(
      enhancedResults,
      criticalResults
    );

    return {
      results: enhancedResults,
      abnormalResults,
      criticalResults,
      trendAnalysis,
      healthInsights,
      recommendations,
      overallAssessment,
    };
  }

  /**
   * Enhance lab results with reference ranges and clinical context
   */
  private static enhanceLabResults(
    results: LabResult[],
    patientGender?: "male" | "female"
  ): EnhancedLabResult[] {
    return results.map((result) => {
      const testKey = this.normalizeTestName(result.testName);
      const referenceData = NIGERIAN_LAB_REFERENCE_RANGES[testKey];
      const criticalValues = CRITICAL_VALUES[testKey];

      const enhanced: EnhancedLabResult = {
        ...result,
        category: this.categorizeTest(testKey),
      };

      if (referenceData) {
        // Determine appropriate reference range based on gender
        const range =
          patientGender && referenceData[patientGender]
            ? referenceData[patientGender]
            : referenceData.all || referenceData.male;

        if (range) {
          enhanced.normalRange = range;
          enhanced.explanation = referenceData.description;

          // Calculate percentile deviation
          const numericValue = extractNumericValue(result.value);
          if (numericValue !== null) {
            const midpoint = (range.min + range.max) / 2;
            const rangeSize = range.max - range.min;
            enhanced.percentileDeviation =
              ((numericValue - midpoint) / rangeSize) * 100;

            // Re-evaluate abnormal status with our reference ranges
            enhanced.isAbnormal =
              numericValue < range.min || numericValue > range.max;
            enhanced.severity = this.calculateSeverity(numericValue, range);
          }
        }
      }

      // Check for critical values
      if (criticalValues) {
        const numericValue = extractNumericValue(result.value);
        if (numericValue !== null) {
          enhanced.isCritical =
            numericValue <= criticalValues.low ||
            numericValue >= criticalValues.high;
        }
      }

      // Add clinical significance and recommendations
      enhanced.clinicalSignificance = this.getClinicaSignificance(
        testKey,
        enhanced
      );
      enhanced.possibleCauses = this.getPossibleCauses(testKey, enhanced);
      enhanced.followUpRecommendations = this.getFollowUpRecommendations(
        testKey,
        enhanced
      );

      return enhanced;
    });
  }

  /**
   * Normalize test names to match our database keys
   */
  private static normalizeTestName(testName: string): string {
    const normalized = testName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w]/g, "")
      .replace(/_+/g, "_");

    // Common aliases
    const aliases: { [key: string]: string } = {
      hgb: "hemoglobin",
      hct: "hematocrit",
      wbc: "white_blood_cells",
      rbc: "red_blood_cells",
      plt: "platelets",
      fbs: "glucose_fasting",
      rbs: "glucose_random",
      cholesterol: "total_cholesterol",
      ldl: "ldl_cholesterol",
      hdl: "hdl_cholesterol",
      tg: "triglycerides",
      sgpt: "alt",
      sgot: "ast",
      alp: "alkaline_phosphatase",
      bun: "blood_urea_nitrogen",
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Categorize tests by system
   */
  private static categorizeTest(testKey: string): string {
    const categories: { [key: string]: string[] } = {
      "Complete Blood Count": [
        "hemoglobin",
        "hematocrit",
        "white_blood_cells",
        "red_blood_cells",
        "platelets",
      ],
      "Blood Chemistry": [
        "glucose_fasting",
        "glucose_random",
        "hba1c",
        "total_cholesterol",
        "ldl_cholesterol",
        "hdl_cholesterol",
        "triglycerides",
      ],
      "Kidney Function": ["creatinine", "blood_urea_nitrogen", "uric_acid"],
      "Liver Function": [
        "alt",
        "ast",
        "alkaline_phosphatase",
        "total_bilirubin",
      ],
      "Thyroid Function": ["tsh", "t3", "t4"],
      Electrolytes: ["sodium", "potassium", "chloride"],
      "Cardiac Markers": ["troponin_i", "ck_mb"],
      "Inflammatory Markers": ["esr", "crp"],
    };

    for (const [category, tests] of Object.entries(categories)) {
      if (tests.includes(testKey)) {
        return category;
      }
    }

    return "Other";
  }

  /**
   * Calculate severity based on deviation from normal range
   */
  private static calculateSeverity(
    value: number,
    range: { min: number; max: number }
  ): "normal" | "mild" | "moderate" | "severe" {
    if (value >= range.min && value <= range.max) {
      return "normal";
    }

    const rangeSize = range.max - range.min;
    const deviation =
      value < range.min
        ? (range.min - value) / rangeSize
        : (value - range.max) / rangeSize;

    if (deviation <= 0.25) return "mild";
    if (deviation <= 0.5) return "moderate";
    return "severe";
  }

  /**
   * Get clinical significance of abnormal results
   */
  private static getClinicaSignificance(
    testKey: string,
    result: EnhancedLabResult
  ): string {
    if (!result.isAbnormal) {
      return "Result is within normal limits";
    }

    const numericValue = extractNumericValue(result.value);
    if (numericValue === null || !result.normalRange) {
      return "Clinical significance unclear";
    }

    const isHigh = numericValue > result.normalRange.max;
    const isLow = numericValue < result.normalRange.min;

    const significanceMap: { [key: string]: { high: string; low: string } } = {
      glucose_fasting: {
        high: "May indicate diabetes or prediabetes",
        low: "May indicate hypoglycemia or insulin overdose",
      },
      hemoglobin: {
        high: "May indicate dehydration or polycythemia",
        low: "May indicate anemia or blood loss",
      },
      creatinine: {
        high: "May indicate kidney dysfunction",
        low: "Usually not clinically significant",
      },
      alt: {
        high: "May indicate liver damage or disease",
        low: "Usually not clinically significant",
      },
      total_cholesterol: {
        high: "Increased risk of heart disease",
        low: "Usually not concerning unless severely low",
      },
      tsh: {
        high: "May indicate hypothyroidism (underactive thyroid)",
        low: "May indicate hyperthyroidism (overactive thyroid)",
      },
      potassium: {
        high: "May cause dangerous heart rhythm abnormalities",
        low: "May cause muscle weakness and heart problems",
      },
    };

    const significance = significanceMap[testKey];
    if (significance) {
      return isHigh ? significance.high : significance.low;
    }

    return isHigh
      ? "Elevated level may require further evaluation"
      : "Low level may require further evaluation";
  }

  /**
   * Get possible causes of abnormal results
   */
  private static getPossibleCauses(
    testKey: string,
    result: EnhancedLabResult
  ): string[] {
    if (!result.isAbnormal) return [];

    const numericValue = extractNumericValue(result.value);
    if (numericValue === null || !result.normalRange) return [];

    const isHigh = numericValue > result.normalRange.max;

    const causesMap: { [key: string]: { high: string[]; low: string[] } } = {
      glucose_fasting: {
        high: ["Diabetes", "Prediabetes", "Stress", "Medications", "Infection"],
        low: [
          "Insulin overdose",
          "Prolonged fasting",
          "Liver disease",
          "Alcohol consumption",
        ],
      },
      hemoglobin: {
        high: [
          "Dehydration",
          "Smoking",
          "Living at high altitude",
          "Polycythemia",
        ],
        low: [
          "Iron deficiency",
          "Blood loss",
          "Chronic disease",
          "Kidney disease",
          "Malnutrition",
        ],
      },
      creatinine: {
        high: [
          "Kidney disease",
          "Dehydration",
          "Muscle breakdown",
          "Certain medications",
        ],
        low: ["Low muscle mass", "Pregnancy", "Aging"],
      },
      total_cholesterol: {
        high: [
          "Diet high in saturated fats",
          "Genetics",
          "Lack of exercise",
          "Diabetes",
          "Hypothyroidism",
        ],
        low: [
          "Malnutrition",
          "Liver disease",
          "Hyperthyroidism",
          "Certain medications",
        ],
      },
    };

    const causes = causesMap[testKey];
    return causes ? (isHigh ? causes.high : causes.low) : [];
  }

  /**
   * Get follow-up recommendations
   */
  private static getFollowUpRecommendations(
    testKey: string,
    result: EnhancedLabResult
  ): string[] {
    if (!result.isAbnormal) {
      return ["Continue regular health monitoring"];
    }

    const recommendations: { [key: string]: string[] } = {
      glucose_fasting: [
        "Consult with doctor about diabetes management",
        "Monitor blood sugar regularly",
        "Consider dietary modifications",
        "Increase physical activity",
      ],
      hemoglobin: [
        "Investigate cause of anemia if low",
        "Consider iron supplementation if deficient",
        "Evaluate for blood loss sources",
        "Follow up with hematologist if severe",
      ],
      creatinine: [
        "Consult nephrologist for kidney evaluation",
        "Monitor kidney function regularly",
        "Review medications that may affect kidneys",
        "Stay well hydrated",
      ],
      total_cholesterol: [
        "Consult doctor about cardiovascular risk",
        "Consider dietary changes to reduce cholesterol",
        "Increase physical activity",
        "May need cholesterol-lowering medication",
      ],
    };

    return (
      recommendations[testKey] || [
        "Discuss results with your healthcare provider",
        "Consider repeat testing to confirm results",
        "Monitor symptoms and overall health",
      ]
    );
  }

  /**
   * Analyze trends in lab results over time
   */
  private static analyzeTrends(
    currentResults: EnhancedLabResult[],
    previousResults: Array<{ date: string; results: LabResult[] }>
  ): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];

    currentResults.forEach((currentResult) => {
      const historicalValues: Array<{
        date: string;
        value: number;
        isAbnormal: boolean;
      }> = [];

      // Collect historical values for this test
      previousResults.forEach(({ date, results }) => {
        const matchingResult = results.find(
          (r) =>
            this.normalizeTestName(r.testName) ===
            this.normalizeTestName(currentResult.testName)
        );

        if (matchingResult) {
          const numericValue = extractNumericValue(matchingResult.value);
          if (numericValue !== null) {
            historicalValues.push({
              date,
              value: numericValue,
              isAbnormal: matchingResult.isAbnormal,
            });
          }
        }
      });

      // Add current value
      const currentNumericValue = extractNumericValue(currentResult.value);
      if (currentNumericValue !== null) {
        historicalValues.push({
          date: new Date().toISOString(),
          value: currentNumericValue,
          isAbnormal: currentResult.isAbnormal,
        });
      }

      if (historicalValues.length >= 2) {
        const sortedValues = historicalValues.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const firstValue = sortedValues[0].value;
        const lastValue = sortedValues[sortedValues.length - 1].value;
        const trendPercentage = ((lastValue - firstValue) / firstValue) * 100;

        let trend: "improving" | "worsening" | "stable";
        let interpretation: string;

        if (Math.abs(trendPercentage) < 5) {
          trend = "stable";
          interpretation = "Values have remained relatively stable over time";
        } else {
          // Determine if change is improving or worsening based on test type
          const isImproving = this.isTrendImproving(
            this.normalizeTestName(currentResult.testName),
            trendPercentage,
            currentResult.normalRange
          );

          trend = isImproving ? "improving" : "worsening";
          interpretation = isImproving
            ? `Values are trending in a positive direction (${Math.abs(
                trendPercentage
              ).toFixed(1)}% change)`
            : `Values are trending in a concerning direction (${Math.abs(
                trendPercentage
              ).toFixed(1)}% change)`;
        }

        trends.push({
          testName: currentResult.testName,
          values: sortedValues,
          trend,
          trendPercentage,
          interpretation,
        });
      }
    });

    return trends;
  }

  /**
   * Determine if a trend is improving based on test type and direction
   */
  private static isTrendImproving(
    testKey: string,
    trendPercentage: number,
    normalRange?: { min: number; max: number }
  ): boolean {
    // For tests where lower is generally better
    const lowerIsBetter = [
      "glucose_fasting",
      "glucose_random",
      "hba1c",
      "total_cholesterol",
      "ldl_cholesterol",
      "triglycerides",
      "creatinine",
      "alt",
      "ast",
    ];

    // For tests where higher is generally better
    const higherIsBetter = ["hdl_cholesterol", "hemoglobin"];

    if (lowerIsBetter.includes(testKey)) {
      return trendPercentage < 0; // Decreasing is improving
    }

    if (higherIsBetter.includes(testKey)) {
      return trendPercentage > 0; // Increasing is improving
    }

    // For other tests, moving toward normal range is improving
    // This is a simplified approach - in practice would need more sophisticated logic
    return Math.abs(trendPercentage) < 10;
  }

  /**
   * Generate health insights based on lab results
   */
  private static generateHealthInsights(
    results: EnhancedLabResult[]
  ): HealthInsight[] {
    const insights: HealthInsight[] = [];

    // Diabetes risk assessment
    const glucoseTests = results.filter((r) =>
      ["glucose_fasting", "glucose_random", "hba1c"].includes(
        this.normalizeTestName(r.testName)
      )
    );

    if (glucoseTests.some((t) => t.isAbnormal)) {
      insights.push({
        category: "Diabetes Risk",
        title: "Elevated Blood Sugar Detected",
        description:
          "Your blood sugar levels are above normal range, which may indicate prediabetes or diabetes.",
        severity: "warning",
        relatedTests: glucoseTests.map((t) => t.testName),
        recommendations: [
          "Consult with a doctor about diabetes screening",
          "Consider dietary modifications to reduce sugar intake",
          "Increase physical activity",
          "Monitor blood sugar levels regularly",
        ],
      });
    }

    // Cardiovascular risk assessment
    const cardiacTests = results.filter((r) =>
      [
        "total_cholesterol",
        "ldl_cholesterol",
        "hdl_cholesterol",
        "triglycerides",
      ].includes(this.normalizeTestName(r.testName))
    );

    if (cardiacTests.some((t) => t.isAbnormal)) {
      insights.push({
        category: "Cardiovascular Health",
        title: "Cholesterol Levels Need Attention",
        description:
          "Your cholesterol profile shows abnormal values that may increase cardiovascular risk.",
        severity: "warning",
        relatedTests: cardiacTests.map((t) => t.testName),
        recommendations: [
          "Discuss cardiovascular risk with your doctor",
          "Consider heart-healthy diet changes",
          "Increase regular exercise",
          "Consider cholesterol medication if recommended",
        ],
      });
    }

    // Kidney function assessment
    const kidneyTests = results.filter((r) =>
      ["creatinine", "blood_urea_nitrogen"].includes(
        this.normalizeTestName(r.testName)
      )
    );

    if (kidneyTests.some((t) => t.isAbnormal)) {
      insights.push({
        category: "Kidney Function",
        title: "Kidney Function Markers Abnormal",
        description:
          "Your kidney function tests show abnormal values that may indicate kidney problems.",
        severity: "warning",
        relatedTests: kidneyTests.map((t) => t.testName),
        recommendations: [
          "Consult with a nephrologist",
          "Monitor kidney function regularly",
          "Stay well hydrated",
          "Review medications that may affect kidneys",
        ],
      });
    }

    return insights;
  }

  /**
   * Generate recommendations based on lab results
   */
  private static generateRecommendations(
    results: EnhancedLabResult[],
    criticalResults: EnhancedLabResult[]
  ): string[] {
    const recommendations: string[] = [];

    if (criticalResults.length > 0) {
      recommendations.push(
        "URGENT: Seek immediate medical attention for critical lab values"
      );
      recommendations.push(
        "Contact your healthcare provider immediately to discuss critical results"
      );
    }

    const abnormalResults = results.filter(
      (r) => r.isAbnormal && !r.isCritical
    );
    if (abnormalResults.length > 0) {
      recommendations.push(
        "Schedule follow-up appointment to discuss abnormal results"
      );
      recommendations.push(
        "Consider repeat testing to confirm abnormal values"
      );
    }

    // Specific recommendations based on test categories
    const categories = [...new Set(results.map((r) => r.category))];

    if (categories.includes("Blood Chemistry")) {
      recommendations.push(
        "Maintain a healthy diet and regular exercise routine"
      );
    }

    if (categories.includes("Kidney Function")) {
      recommendations.push("Stay well hydrated and monitor blood pressure");
    }

    if (categories.includes("Liver Function")) {
      recommendations.push(
        "Limit alcohol consumption and avoid hepatotoxic medications"
      );
    }

    recommendations.push(
      "Keep a copy of your lab results for future reference"
    );
    recommendations.push(
      "Discuss any symptoms or concerns with your healthcare provider"
    );

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Assess overall status of lab results
   */
  private static assessOverallStatus(
    results: EnhancedLabResult[],
    criticalResults: EnhancedLabResult[]
  ): {
    status:
      | "normal"
      | "mild_abnormal"
      | "moderate_abnormal"
      | "severe_abnormal"
      | "critical";
    summary: string;
    urgencyLevel: "low" | "medium" | "high" | "critical";
  } {
    if (criticalResults.length > 0) {
      return {
        status: "critical",
        summary: `${criticalResults.length} critical values detected requiring immediate medical attention`,
        urgencyLevel: "critical",
      };
    }

    const abnormalResults = results.filter((r) => r.isAbnormal);
    const severeAbnormal = abnormalResults.filter(
      (r) => r.severity === "severe"
    );
    const moderateAbnormal = abnormalResults.filter(
      (r) => r.severity === "moderate"
    );

    if (severeAbnormal.length > 0) {
      return {
        status: "severe_abnormal",
        summary: `${severeAbnormal.length} severely abnormal results detected`,
        urgencyLevel: "high",
      };
    }

    if (moderateAbnormal.length > 0) {
      return {
        status: "moderate_abnormal",
        summary: `${moderateAbnormal.length} moderately abnormal results detected`,
        urgencyLevel: "medium",
      };
    }

    if (abnormalResults.length > 0) {
      return {
        status: "mild_abnormal",
        summary: `${abnormalResults.length} mildly abnormal results detected`,
        urgencyLevel: "medium",
      };
    }

    return {
      status: "normal",
      summary: "All lab results are within normal limits",
      urgencyLevel: "low",
    };
  }
}
