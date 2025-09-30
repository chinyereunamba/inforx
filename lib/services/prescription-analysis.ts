import { Medication } from "@/lib/services/ai-medical-interpretation";
import {
  normalizeMedicationFrequency,
  extractMedicationSchedule,
  checkBasicDrugInteractions,
} from "@/lib/utils/medical-data-processing";

/**
 * Comprehensive prescription analysis and interpretation service
 */

// Nigerian medication database (simplified version)
const NIGERIAN_MEDICATION_DATABASE = {
  // Common medications with their generic names, side effects, and interactions
  medications: {
    paracetamol: {
      genericName: "Acetaminophen",
      category: "Analgesic/Antipyretic",
      commonDosages: ["500mg", "1000mg"],
      maxDailyDose: "4000mg",
      sideEffects: ["Liver damage (with overdose)", "Allergic reactions"],
      contraindications: ["Severe liver disease", "Alcohol dependency"],
      interactions: ["Warfarin", "Alcohol"],
      pregnancyCategory: "B",
      instructions: "Take with or without food. Do not exceed 4g per day.",
    },
    ibuprofen: {
      genericName: "Ibuprofen",
      category: "NSAID",
      commonDosages: ["200mg", "400mg", "600mg"],
      maxDailyDose: "2400mg",
      sideEffects: ["Stomach upset", "Kidney problems", "Heart problems"],
      contraindications: ["Peptic ulcer", "Kidney disease", "Heart failure"],
      interactions: ["Warfarin", "ACE inhibitors", "Diuretics"],
      pregnancyCategory: "C",
      instructions: "Take with food to reduce stomach upset.",
    },
    amoxicillin: {
      genericName: "Amoxicillin",
      category: "Antibiotic (Penicillin)",
      commonDosages: ["250mg", "500mg", "875mg"],
      maxDailyDose: "3000mg",
      sideEffects: ["Diarrhea", "Nausea", "Allergic reactions"],
      contraindications: ["Penicillin allergy"],
      interactions: ["Methotrexate", "Oral contraceptives"],
      pregnancyCategory: "B",
      instructions: "Complete the full course even if feeling better.",
    },
    metformin: {
      genericName: "Metformin",
      category: "Antidiabetic (Biguanide)",
      commonDosages: ["500mg", "850mg", "1000mg"],
      maxDailyDose: "2550mg",
      sideEffects: ["Nausea", "Diarrhea", "Lactic acidosis (rare)"],
      contraindications: ["Kidney disease", "Liver disease", "Heart failure"],
      interactions: ["Alcohol", "Contrast dyes"],
      pregnancyCategory: "B",
      instructions: "Take with meals to reduce stomach upset.",
    },
    lisinopril: {
      genericName: "Lisinopril",
      category: "ACE Inhibitor",
      commonDosages: ["5mg", "10mg", "20mg", "40mg"],
      maxDailyDose: "80mg",
      sideEffects: ["Dry cough", "Dizziness", "Hyperkalemia"],
      contraindications: ["Pregnancy", "Angioedema history"],
      interactions: ["Potassium supplements", "NSAIDs", "Diuretics"],
      pregnancyCategory: "D",
      instructions:
        "Monitor blood pressure regularly. Avoid potassium supplements.",
    },
    amlodipine: {
      genericName: "Amlodipine",
      category: "Calcium Channel Blocker",
      commonDosages: ["2.5mg", "5mg", "10mg"],
      maxDailyDose: "10mg",
      sideEffects: ["Ankle swelling", "Dizziness", "Flushing"],
      contraindications: ["Severe aortic stenosis"],
      interactions: ["Simvastatin", "Grapefruit juice"],
      pregnancyCategory: "C",
      instructions: "Take at the same time each day. Avoid grapefruit.",
    },
    omeprazole: {
      genericName: "Omeprazole",
      category: "Proton Pump Inhibitor",
      commonDosages: ["20mg", "40mg"],
      maxDailyDose: "80mg",
      sideEffects: ["Headache", "Nausea", "Bone fractures (long-term)"],
      contraindications: ["Hypersensitivity to PPIs"],
      interactions: ["Clopidogrel", "Warfarin", "Digoxin"],
      pregnancyCategory: "C",
      instructions: "Take before meals. Do not crush or chew capsules.",
    },
    chloroquine: {
      genericName: "Chloroquine",
      category: "Antimalarial",
      commonDosages: ["250mg", "500mg"],
      maxDailyDose: "1000mg",
      sideEffects: ["Nausea", "Headache", "Retinal toxicity (long-term)"],
      contraindications: ["Retinal disease", "G6PD deficiency"],
      interactions: ["Digoxin", "Insulin"],
      pregnancyCategory: "C",
      instructions:
        "Take with food. Regular eye exams needed for long-term use.",
    },
    artemether: {
      genericName: "Artemether/Lumefantrine",
      category: "Antimalarial",
      commonDosages: ["20mg/120mg", "40mg/240mg"],
      maxDailyDose: "As prescribed",
      sideEffects: ["Headache", "Dizziness", "Nausea"],
      contraindications: ["Severe malaria", "QT prolongation"],
      interactions: ["QT-prolonging drugs"],
      pregnancyCategory: "C",
      instructions: "Take with fatty food for better absorption.",
    },
  },

  // Drug interaction matrix
  interactions: [
    {
      drug1: "warfarin",
      drug2: "paracetamol",
      severity: "moderate",
      description: "Increased bleeding risk with high doses of paracetamol",
      management: "Monitor INR more frequently",
    },
    {
      drug1: "warfarin",
      drug2: "ibuprofen",
      severity: "severe",
      description: "Significantly increased bleeding risk",
      management: "Avoid combination or use alternative pain relief",
    },
    {
      drug1: "lisinopril",
      drug2: "ibuprofen",
      severity: "moderate",
      description: "Reduced antihypertensive effect and increased kidney risk",
      management: "Monitor blood pressure and kidney function",
    },
    {
      drug1: "metformin",
      drug2: "alcohol",
      severity: "severe",
      description: "Increased risk of lactic acidosis",
      management: "Limit alcohol consumption",
    },
  ],
};

export interface PrescriptionAnalysis {
  medications: EnhancedMedication[];
  drugInteractions: DrugInteraction[];
  medicationSchedule: MedicationSchedule[];
  safetyAlerts: SafetyAlert[];
  adherenceRecommendations: string[];
  totalMedications: number;
  complexityScore: number;
}

export interface EnhancedMedication extends Medication {
  genericName?: string;
  category?: string;
  maxDailyDose?: string;
  contraindications?: string[];
  pregnancyCategory?: string;
  enhancedInstructions?: string;
  safetyWarnings?: string[];
  isHighRisk?: boolean;
}

export interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  management: string;
  clinicalSignificance: string;
}

export interface MedicationSchedule {
  medicationName: string;
  times: string[];
  instructions: string;
  specialInstructions?: string;
  foodRequirements?: "with_food" | "without_food" | "empty_stomach" | "any";
}

export interface SafetyAlert {
  type:
    | "dosage"
    | "interaction"
    | "contraindication"
    | "monitoring"
    | "allergy";
  severity: "low" | "medium" | "high" | "critical";
  medication: string;
  message: string;
  action: string;
}

export class PrescriptionAnalysisService {
  /**
   * Analyze a prescription and provide comprehensive interpretation
   */
  static analyzePrescription(medications: Medication[]): PrescriptionAnalysis {
    const enhancedMedications = this.enhanceMedications(medications);
    const drugInteractions = this.analyzeDrugInteractions(enhancedMedications);
    const medicationSchedule =
      this.generateMedicationSchedule(enhancedMedications);
    const safetyAlerts = this.generateSafetyAlerts(
      enhancedMedications,
      drugInteractions
    );
    const adherenceRecommendations =
      this.generateAdherenceRecommendations(enhancedMedications);
    const complexityScore = this.calculateComplexityScore(
      enhancedMedications,
      medicationSchedule
    );

    return {
      medications: enhancedMedications,
      drugInteractions,
      medicationSchedule,
      safetyAlerts,
      adherenceRecommendations,
      totalMedications: medications.length,
      complexityScore,
    };
  }

  /**
   * Enhance medications with database information
   */
  private static enhanceMedications(
    medications: Medication[]
  ): EnhancedMedication[] {
    return medications.map((medication) => {
      const medicationName = medication.name.toLowerCase();
      const dbInfo = this.findMedicationInDatabase(medicationName);

      const enhanced: EnhancedMedication = {
        ...medication,
        frequency: normalizeMedicationFrequency(medication.frequency),
      };

      if (dbInfo) {
        enhanced.genericName = dbInfo.genericName;
        enhanced.category = dbInfo.category;
        enhanced.maxDailyDose = dbInfo.maxDailyDose;
        enhanced.contraindications = dbInfo.contraindications;
        enhanced.pregnancyCategory = dbInfo.pregnancyCategory;
        enhanced.enhancedInstructions = dbInfo.instructions;
        enhanced.sideEffects = [
          ...(enhanced.sideEffects || []),
          ...dbInfo.sideEffects,
        ];
        enhanced.isHighRisk = this.isHighRiskMedication(dbInfo);
        enhanced.safetyWarnings = this.generateSafetyWarnings(
          medication,
          dbInfo
        );
      }

      return enhanced;
    });
  }

  /**
   * Find medication in database
   */
  private static findMedicationInDatabase(medicationName: string) {
    const name = medicationName.toLowerCase();

    // Direct match
    if (NIGERIAN_MEDICATION_DATABASE.medications[name]) {
      return NIGERIAN_MEDICATION_DATABASE.medications[name];
    }

    // Partial match
    for (const [dbName, info] of Object.entries(
      NIGERIAN_MEDICATION_DATABASE.medications
    )) {
      if (name.includes(dbName) || dbName.includes(name)) {
        return info;
      }
    }

    return null;
  }

  /**
   * Analyze drug interactions
   */
  private static analyzeDrugInteractions(
    medications: EnhancedMedication[]
  ): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    const medicationNames = medications.map((med) => med.name.toLowerCase());

    // Check against database interactions
    for (const interaction of NIGERIAN_MEDICATION_DATABASE.interactions) {
      const drug1Match = medicationNames.find(
        (name) =>
          name.includes(interaction.drug1) || interaction.drug1.includes(name)
      );
      const drug2Match = medicationNames.find(
        (name) =>
          name.includes(interaction.drug2) || interaction.drug2.includes(name)
      );

      if (drug1Match && drug2Match) {
        interactions.push({
          medication1: drug1Match,
          medication2: drug2Match,
          severity: interaction.severity as "mild" | "moderate" | "severe",
          description: interaction.description,
          management: interaction.management,
          clinicalSignificance: this.assessClinicalSignificance(
            interaction.severity
          ),
        });
      }
    }

    // Check for same-class interactions
    const sameClassInteractions = this.checkSameClassInteractions(medications);
    interactions.push(...sameClassInteractions);

    return interactions;
  }

  /**
   * Check for same medication class interactions
   */
  private static checkSameClassInteractions(
    medications: EnhancedMedication[]
  ): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    const medicationsByClass: { [key: string]: EnhancedMedication[] } = {};

    // Group medications by class
    medications.forEach((med) => {
      if (med.category) {
        if (!medicationsByClass[med.category]) {
          medicationsByClass[med.category] = [];
        }
        medicationsByClass[med.category].push(med);
      }
    });

    // Check for multiple medications in same class
    Object.entries(medicationsByClass).forEach(([category, meds]) => {
      if (meds.length > 1) {
        for (let i = 0; i < meds.length; i++) {
          for (let j = i + 1; j < meds.length; j++) {
            interactions.push({
              medication1: meds[i].name,
              medication2: meds[j].name,
              severity: "moderate",
              description: `Multiple medications from the same class (${category}) may increase risk of side effects`,
              management: "Monitor for enhanced effects and side effects",
              clinicalSignificance: "May require dose adjustment or monitoring",
            });
          }
        }
      }
    });

    return interactions;
  }

  /**
   * Generate medication schedule
   */
  private static generateMedicationSchedule(
    medications: EnhancedMedication[]
  ): MedicationSchedule[] {
    return medications.map((medication) => {
      const times = extractMedicationSchedule(medication.frequency);
      const foodRequirements = this.determineFoodRequirements(medication);

      return {
        medicationName: medication.name,
        times,
        instructions: `${medication.dosage} ${medication.frequency}`,
        specialInstructions: medication.enhancedInstructions,
        foodRequirements,
      };
    });
  }

  /**
   * Determine food requirements for medication
   */
  private static determineFoodRequirements(
    medication: EnhancedMedication
  ): "with_food" | "without_food" | "empty_stomach" | "any" {
    const name = medication.name.toLowerCase();
    const instructions = (medication.instructions || "").toLowerCase();
    const enhancedInstructions = (
      medication.enhancedInstructions || ""
    ).toLowerCase();

    if (
      instructions.includes("with food") ||
      enhancedInstructions.includes("with food") ||
      name.includes("ibuprofen") ||
      name.includes("metformin")
    ) {
      return "with_food";
    }

    if (
      instructions.includes("empty stomach") ||
      enhancedInstructions.includes("before meals")
    ) {
      return "empty_stomach";
    }

    if (instructions.includes("without food")) {
      return "without_food";
    }

    return "any";
  }

  /**
   * Generate safety alerts
   */
  private static generateSafetyAlerts(
    medications: EnhancedMedication[],
    interactions: DrugInteraction[]
  ): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];

    // Dosage alerts
    medications.forEach((medication) => {
      if (this.isDosageExcessive(medication)) {
        alerts.push({
          type: "dosage",
          severity: "high",
          medication: medication.name,
          message: `Dosage may exceed recommended maximum`,
          action: "Verify dosage with healthcare provider",
        });
      }
    });

    // Interaction alerts
    interactions.forEach((interaction) => {
      alerts.push({
        type: "interaction",
        severity:
          interaction.severity === "severe"
            ? "critical"
            : interaction.severity === "moderate"
            ? "high"
            : "medium",
        medication: `${interaction.medication1} + ${interaction.medication2}`,
        message: interaction.description,
        action: interaction.management,
      });
    });

    // High-risk medication alerts
    medications.forEach((medication) => {
      if (medication.isHighRisk) {
        alerts.push({
          type: "monitoring",
          severity: "high",
          medication: medication.name,
          message: "This medication requires regular monitoring",
          action: "Schedule regular follow-up appointments",
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate adherence recommendations
   */
  private static generateAdherenceRecommendations(
    medications: EnhancedMedication[]
  ): string[] {
    const recommendations: string[] = [];

    if (medications.length > 3) {
      recommendations.push(
        "Consider using a pill organizer to manage multiple medications"
      );
    }

    if (
      medications.some(
        (med) =>
          med.frequency.includes("three times") ||
          med.frequency.includes("four times")
      )
    ) {
      recommendations.push(
        "Set phone alarms or reminders for frequent dosing schedules"
      );
    }

    if (medications.some((med) => med.category === "Antibiotic")) {
      recommendations.push(
        "Complete the full course of antibiotics even if you feel better"
      );
    }

    if (medications.some((med) => med.category === "Antidiabetic")) {
      recommendations.push(
        "Monitor blood sugar levels regularly and maintain a medication log"
      );
    }

    if (medications.some((med) => med.category?.includes("Blood pressure"))) {
      recommendations.push(
        "Take blood pressure medications at the same time each day"
      );
    }

    recommendations.push("Keep a medication list with you at all times");
    recommendations.push(
      "Never stop medications abruptly without consulting your doctor"
    );

    return recommendations;
  }

  /**
   * Calculate prescription complexity score
   */
  private static calculateComplexityScore(
    medications: EnhancedMedication[],
    schedule: MedicationSchedule[]
  ): number {
    let score = 0;

    // Base score for number of medications
    score += medications.length * 10;

    // Add points for frequency complexity
    schedule.forEach((sched) => {
      score += sched.times.length * 5;
    });

    // Add points for high-risk medications
    score += medications.filter((med) => med.isHighRisk).length * 15;

    // Add points for special instructions
    score += medications.filter((med) => med.enhancedInstructions).length * 5;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Check if dosage is excessive
   */
  private static isDosageExcessive(medication: EnhancedMedication): boolean {
    if (!medication.maxDailyDose) return false;

    // This is a simplified check - in practice, would need more sophisticated parsing
    const dosageMatch = medication.dosage.match(/(\d+)/);
    const maxDoseMatch = medication.maxDailyDose.match(/(\d+)/);

    if (dosageMatch && maxDoseMatch) {
      const currentDose = parseInt(dosageMatch[1]);
      const maxDose = parseInt(maxDoseMatch[1]);

      // Simple frequency multiplier (this would need to be more sophisticated)
      const frequencyMultiplier = medication.frequency.includes("twice")
        ? 2
        : medication.frequency.includes("three")
        ? 3
        : medication.frequency.includes("four")
        ? 4
        : 1;

      return currentDose * frequencyMultiplier > maxDose;
    }

    return false;
  }

  /**
   * Check if medication is high risk
   */
  private static isHighRiskMedication(dbInfo: any): boolean {
    const highRiskCategories = [
      "Anticoagulant",
      "Insulin",
      "Chemotherapy",
      "Immunosuppressant",
    ];
    const highRiskMedications = ["warfarin", "digoxin", "lithium", "phenytoin"];

    return (
      highRiskCategories.includes(dbInfo.category) ||
      highRiskMedications.some((med) =>
        dbInfo.genericName?.toLowerCase().includes(med)
      )
    );
  }

  /**
   * Generate safety warnings for medication
   */
  private static generateSafetyWarnings(
    medication: Medication,
    dbInfo: any
  ): string[] {
    const warnings: string[] = [];

    if (dbInfo.pregnancyCategory === "D" || dbInfo.pregnancyCategory === "X") {
      warnings.push(
        "Not safe during pregnancy - consult doctor if pregnant or planning pregnancy"
      );
    }

    if (dbInfo.category === "NSAID") {
      warnings.push(
        "May cause stomach upset - take with food and avoid alcohol"
      );
    }

    if (dbInfo.category === "Antibiotic") {
      warnings.push("Complete full course even if symptoms improve");
    }

    return warnings;
  }

  /**
   * Assess clinical significance of interaction
   */
  private static assessClinicalSignificance(severity: string): string {
    switch (severity) {
      case "severe":
        return "Potentially life-threatening - immediate medical attention may be required";
      case "moderate":
        return "May require dose adjustment or additional monitoring";
      case "mild":
        return "Monitor for increased side effects";
      default:
        return "Clinical significance unclear";
    }
  }
}
