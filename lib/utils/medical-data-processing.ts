import {
  MedicalAnalysisResult,
  Medication,
  LabResult,
} from "@/lib/services/ai-medical-interpretation";

/**
 * Utility functions for processing and validating medical data
 */

// Common medical units and their variations
const MEDICAL_UNITS = {
  // Blood pressure
  mmhg: ["mmhg", "mm hg", "mmhg.", "mm-hg"],
  // Blood sugar
  "mg/dl": ["mg/dl", "mg/dl.", "mgdl", "mg per dl"],
  "mmol/l": ["mmol/l", "mmol/l.", "mmoll", "mmol per l"],
  // Cholesterol
  "mg/dl": ["mg/dl", "mg/dl.", "mgdl"],
  // Weight
  kg: ["kg", "kg.", "kgs", "kilograms"],
  lbs: ["lbs", "lb", "pounds"],
  // Temperature
  "°c": ["°c", "c", "celsius", "deg c"],
  "°f": ["°f", "f", "fahrenheit", "deg f"],
};

// Common medication frequency patterns
const FREQUENCY_PATTERNS = {
  "once daily": ["once daily", "od", "qd", "1x daily", "daily"],
  "twice daily": ["twice daily", "bd", "bid", "2x daily", "twice a day"],
  "three times daily": [
    "three times daily",
    "tds",
    "tid",
    "3x daily",
    "thrice daily",
  ],
  "four times daily": ["four times daily", "qds", "qid", "4x daily"],
  "as needed": ["as needed", "prn", "when needed", "if needed"],
  "before meals": ["before meals", "ac", "ante cibum", "before eating"],
  "after meals": ["after meals", "pc", "post cibum", "after eating"],
  "at bedtime": ["at bedtime", "hs", "hora somni", "before sleep"],
};

// Nigerian-specific medical context
const NIGERIAN_MEDICAL_CONTEXT = {
  commonConditions: [
    "malaria",
    "typhoid",
    "hypertension",
    "diabetes",
    "sickle cell",
    "hepatitis b",
    "tuberculosis",
    "hiv",
    "peptic ulcer",
  ],
  commonMedications: [
    "paracetamol",
    "ibuprofen",
    "amoxicillin",
    "chloroquine",
    "artemether",
    "metformin",
    "lisinopril",
    "amlodipine",
    "omeprazole",
  ],
  emergencyKeywords: [
    "emergency",
    "urgent",
    "critical",
    "severe",
    "acute",
    "immediate",
    "life-threatening",
    "hospital admission",
    "icu",
    "intensive care",
  ],
};

/**
 * Normalize medical units to standard format
 */
export function normalizeMedicalUnit(unit: string): string {
  const normalizedInput = unit.toLowerCase().trim();

  for (const [standardUnit, variations] of Object.entries(MEDICAL_UNITS)) {
    if (variations.includes(normalizedInput)) {
      return standardUnit;
    }
  }

  return unit; // Return original if no match found
}

/**
 * Normalize medication frequency to standard format
 */
export function normalizeMedicationFrequency(frequency: string): string {
  const normalizedInput = frequency.toLowerCase().trim();

  for (const [standardFreq, variations] of Object.entries(FREQUENCY_PATTERNS)) {
    if (variations.some((variation) => normalizedInput.includes(variation))) {
      return standardFreq;
    }
  }

  return frequency; // Return original if no match found
}

/**
 * Extract numeric value from lab result
 */
export function extractNumericValue(value: string): number | null {
  const match = value.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Parse reference range string
 */
export function parseReferenceRange(
  range: string
): { min: number; max: number } | null {
  // Handle various formats: "10-20", "10 - 20", "10 to 20", "<20", ">10"
  const rangePatterns = [
    /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/, // 10-20 or 10 - 20
    /(\d+\.?\d*)\s+to\s+(\d+\.?\d*)/, // 10 to 20
    /<\s*(\d+\.?\d*)/, // <20 (max only)
    />\s*(\d+\.?\d*)/, // >10 (min only)
  ];

  for (const pattern of rangePatterns) {
    const match = range.match(pattern);
    if (match) {
      if (pattern.source.includes("<")) {
        return { min: 0, max: parseFloat(match[1]) };
      } else if (pattern.source.includes(">")) {
        return { min: parseFloat(match[1]), max: Infinity };
      } else {
        return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
      }
    }
  }

  return null;
}

/**
 * Check if lab result is abnormal based on reference range
 */
export function isLabResultAbnormal(
  value: string,
  referenceRange?: string
): boolean {
  if (!referenceRange) return false;

  const numericValue = extractNumericValue(value);
  if (numericValue === null) return false;

  const range = parseReferenceRange(referenceRange);
  if (!range) return false;

  return numericValue < range.min || numericValue > range.max;
}

/**
 * Determine lab result severity
 */
export function getLabResultSeverity(
  value: string,
  referenceRange?: string
): "normal" | "mild" | "moderate" | "severe" {
  if (!referenceRange) return "normal";

  const numericValue = extractNumericValue(value);
  if (numericValue === null) return "normal";

  const range = parseReferenceRange(referenceRange);
  if (!range) return "normal";

  if (numericValue >= range.min && numericValue <= range.max) {
    return "normal";
  }

  // Calculate deviation percentage
  const midpoint = (range.min + range.max) / 2;
  const rangeSize = range.max - range.min;
  const deviation = Math.abs(numericValue - midpoint) / rangeSize;

  if (deviation <= 0.25) return "mild";
  if (deviation <= 0.5) return "moderate";
  return "severe";
}

/**
 * Extract medication schedule from frequency
 */
export function extractMedicationSchedule(frequency: string): string[] {
  const normalizedFreq = normalizeMedicationFrequency(frequency);

  const schedules: Record<string, string[]> = {
    "once daily": ["08:00"],
    "twice daily": ["08:00", "20:00"],
    "three times daily": ["08:00", "14:00", "20:00"],
    "four times daily": ["08:00", "12:00", "16:00", "20:00"],
    "before meals": ["07:30", "12:30", "19:30"],
    "after meals": ["08:30", "13:30", "20:30"],
    "at bedtime": ["22:00"],
  };

  return schedules[normalizedFreq] || [];
}

/**
 * Check for potential drug interactions (basic implementation)
 */
export function checkBasicDrugInteractions(medications: Medication[]): Array<{
  medication1: string;
  medication2: string;
  interaction: string;
  severity: "mild" | "moderate" | "severe";
}> {
  const interactions: Array<{
    drugs: string[];
    interaction: string;
    severity: "mild" | "moderate" | "severe";
  }> = [
    {
      drugs: ["warfarin", "aspirin"],
      interaction: "Increased bleeding risk",
      severity: "severe",
    },
    {
      drugs: ["metformin", "alcohol"],
      interaction: "Increased risk of lactic acidosis",
      severity: "moderate",
    },
    {
      drugs: ["lisinopril", "potassium"],
      interaction: "Risk of hyperkalemia",
      severity: "moderate",
    },
    // Add more interactions as needed
  ];

  const results: Array<{
    medication1: string;
    medication2: string;
    interaction: string;
    severity: "mild" | "moderate" | "severe";
  }> = [];

  const medicationNames = medications.map((med) => med.name.toLowerCase());

  for (const interaction of interactions) {
    const matchingDrugs = interaction.drugs.filter((drug) =>
      medicationNames.some((medName) => medName.includes(drug))
    );

    if (matchingDrugs.length >= 2) {
      results.push({
        medication1: matchingDrugs[0],
        medication2: matchingDrugs[1],
        interaction: interaction.interaction,
        severity: interaction.severity,
      });
    }
  }

  return results;
}

/**
 * Assess urgency level based on content analysis
 */
export function assessUrgencyLevel(
  extractedData: MedicalAnalysisResult["extractedData"],
  textContent: string
): "low" | "medium" | "high" | "critical" {
  const content = textContent.toLowerCase();

  // Critical indicators
  const criticalKeywords = [
    "emergency",
    "critical",
    "life-threatening",
    "urgent admission",
    "icu",
    "intensive care",
    "cardiac arrest",
    "stroke",
    "heart attack",
  ];

  if (criticalKeywords.some((keyword) => content.includes(keyword))) {
    return "critical";
  }

  // High urgency indicators
  const highUrgencyKeywords = [
    "severe",
    "acute",
    "urgent",
    "immediate",
    "hospital admission",
    "abnormal",
    "elevated",
    "low",
    "high risk",
  ];

  // Check for severely abnormal lab results
  const severeAbnormalResults = extractedData.labResults.filter(
    (result) =>
      result.isAbnormal &&
      getLabResultSeverity(result.value, result.referenceRange) === "severe"
  );

  if (
    highUrgencyKeywords.some((keyword) => content.includes(keyword)) ||
    severeAbnormalResults.length > 0
  ) {
    return "high";
  }

  // Medium urgency indicators
  const mediumUrgencyKeywords = [
    "follow-up",
    "monitor",
    "recheck",
    "abnormal",
    "consultation",
  ];

  const mildAbnormalResults = extractedData.labResults.filter(
    (result) =>
      result.isAbnormal &&
      ["mild", "moderate"].includes(
        getLabResultSeverity(result.value, result.referenceRange)
      )
  );

  if (
    mediumUrgencyKeywords.some((keyword) => content.includes(keyword)) ||
    mildAbnormalResults.length > 0
  ) {
    return "medium";
  }

  return "low";
}

/**
 * Generate medication reminders based on schedule
 */
export function generateMedicationReminders(medications: Medication[]): Array<{
  medicationName: string;
  time: string;
  instructions: string;
}> {
  const reminders: Array<{
    medicationName: string;
    time: string;
    instructions: string;
  }> = [];

  for (const medication of medications) {
    const schedule = extractMedicationSchedule(medication.frequency);

    for (const time of schedule) {
      reminders.push({
        medicationName: medication.name,
        time,
        instructions: `Take ${medication.dosage} ${
          medication.instructions || ""
        }`.trim(),
      });
    }
  }

  return reminders.sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Validate and enhance extracted medical data
 */
export function validateAndEnhanceMedicalData(
  analysis: MedicalAnalysisResult,
  textContent: string
): MedicalAnalysisResult {
  // Enhance medications with normalized data
  const enhancedMedications = analysis.extractedData.medications.map((med) => ({
    ...med,
    frequency: normalizeMedicationFrequency(med.frequency),
  }));

  // Enhance lab results with severity assessment
  const enhancedLabResults = analysis.extractedData.labResults.map(
    (result) => ({
      ...result,
      severity: getLabResultSeverity(result.value, result.referenceRange),
      isAbnormal: result.referenceRange
        ? isLabResultAbnormal(result.value, result.referenceRange)
        : result.isAbnormal,
    })
  );

  // Check for drug interactions
  const interactions = checkBasicDrugInteractions(enhancedMedications);

  // Add interaction warnings to medications
  const medicationsWithInteractions = enhancedMedications.map((med) => ({
    ...med,
    interactions: [
      ...(med.interactions || []),
      ...interactions
        .filter(
          (int) =>
            int.medication1.includes(med.name.toLowerCase()) ||
            int.medication2.includes(med.name.toLowerCase())
        )
        .map((int) => `${int.interaction} (${int.severity})`),
    ],
  }));

  // Reassess urgency level
  const reassessedUrgency = assessUrgencyLevel(
    {
      ...analysis.extractedData,
      medications: medicationsWithInteractions,
      labResults: enhancedLabResults,
    },
    textContent
  );

  return {
    ...analysis,
    extractedData: {
      ...analysis.extractedData,
      medications: medicationsWithInteractions,
      labResults: enhancedLabResults,
    },
    urgencyLevel: reassessedUrgency,
  };
}
