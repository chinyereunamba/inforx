/**
 * Medical scan interpretation and analysis service
 */

// Common scan types and their characteristics
const SCAN_TYPES = {
  "x-ray": {
    name: "X-Ray",
    description:
      "Uses radiation to create images of bones and some soft tissues",
    commonFindings: [
      "fractures",
      "pneumonia",
      "bone abnormalities",
      "foreign objects",
    ],
    urgentFindings: [
      "pneumothorax",
      "fractures",
      "pneumonia",
      "bowel obstruction",
    ],
  },
  ct_scan: {
    name: "CT Scan",
    description:
      "Detailed cross-sectional images using X-rays and computer processing",
    commonFindings: ["tumors", "bleeding", "infections", "organ abnormalities"],
    urgentFindings: [
      "stroke",
      "internal bleeding",
      "pulmonary embolism",
      "aortic dissection",
    ],
  },
  mri: {
    name: "MRI",
    description:
      "Uses magnetic fields and radio waves to create detailed images",
    commonFindings: [
      "soft tissue abnormalities",
      "brain lesions",
      "joint problems",
      "tumors",
    ],
    urgentFindings: ["brain tumor", "spinal cord compression", "acute stroke"],
  },
  ultrasound: {
    name: "Ultrasound",
    description:
      "Uses sound waves to create real-time images of internal structures",
    commonFindings: [
      "gallstones",
      "kidney stones",
      "pregnancy monitoring",
      "organ size",
    ],
    urgentFindings: [
      "ectopic pregnancy",
      "aortic aneurysm",
      "deep vein thrombosis",
    ],
  },
  mammogram: {
    name: "Mammogram",
    description: "Specialized X-ray examination of the breast",
    commonFindings: [
      "breast density",
      "calcifications",
      "masses",
      "architectural distortion",
    ],
    urgentFindings: ["suspicious masses", "malignant calcifications"],
  },
  bone_scan: {
    name: "Bone Scan",
    description: "Nuclear medicine scan to detect bone abnormalities",
    commonFindings: ["arthritis", "fractures", "infections", "metastases"],
    urgentFindings: ["bone metastases", "osteomyelitis"],
  },
};

// Anatomical regions and common findings
const ANATOMICAL_REGIONS = {
  chest: {
    name: "Chest",
    organs: ["lungs", "heart", "ribs", "spine"],
    commonFindings: [
      "pneumonia",
      "pleural effusion",
      "cardiomegaly",
      "rib fractures",
    ],
    urgentFindings: [
      "pneumothorax",
      "massive pleural effusion",
      "aortic dissection",
    ],
  },
  abdomen: {
    name: "Abdomen",
    organs: ["liver", "kidneys", "spleen", "pancreas", "bowel"],
    commonFindings: [
      "kidney stones",
      "gallstones",
      "hepatomegaly",
      "bowel gas",
    ],
    urgentFindings: ["bowel obstruction", "appendicitis", "internal bleeding"],
  },
  pelvis: {
    name: "Pelvis",
    organs: ["bladder", "reproductive organs", "pelvic bones"],
    commonFindings: [
      "ovarian cysts",
      "prostate enlargement",
      "pelvic fractures",
    ],
    urgentFindings: [
      "ectopic pregnancy",
      "ovarian torsion",
      "pelvic fractures",
    ],
  },
  head: {
    name: "Head/Brain",
    organs: ["brain", "skull", "sinuses"],
    commonFindings: ["sinusitis", "brain atrophy", "small vessel disease"],
    urgentFindings: [
      "stroke",
      "brain hemorrhage",
      "mass effect",
      "skull fracture",
    ],
  },
  spine: {
    name: "Spine",
    organs: ["vertebrae", "spinal cord", "discs"],
    commonFindings: ["disc degeneration", "arthritis", "scoliosis"],
    urgentFindings: [
      "spinal cord compression",
      "vertebral fractures",
      "cauda equina syndrome",
    ],
  },
  extremities: {
    name: "Arms/Legs",
    organs: ["bones", "joints", "soft tissues"],
    commonFindings: ["arthritis", "soft tissue swelling", "bone spurs"],
    urgentFindings: [
      "fractures",
      "compartment syndrome",
      "deep vein thrombosis",
    ],
  },
};

// Severity classifications
const SEVERITY_LEVELS = {
  normal: {
    description: "No significant abnormalities detected",
    urgency: "routine",
    followUp: "routine_monitoring",
  },
  mild: {
    description: "Minor abnormalities that may not require immediate treatment",
    urgency: "non_urgent",
    followUp: "routine_follow_up",
  },
  moderate: {
    description: "Abnormalities that require medical attention and monitoring",
    urgency: "semi_urgent",
    followUp: "specialist_referral",
  },
  severe: {
    description:
      "Significant abnormalities requiring prompt medical intervention",
    urgency: "urgent",
    followUp: "immediate_specialist",
  },
  critical: {
    description:
      "Life-threatening findings requiring immediate medical attention",
    urgency: "emergency",
    followUp: "emergency_care",
  },
};

export interface ScanAnalysis {
  scanType: string;
  anatomicalRegion: string;
  findings: ScanFinding[];
  overallAssessment: OverallAssessment;
  recommendations: ScanRecommendation[];
  specialistReferrals: SpecialistReferral[];
  followUpInstructions: string[];
  patientEducation: PatientEducation[];
}

export interface ScanFinding {
  id: string;
  description: string;
  location: string;
  severity: "normal" | "mild" | "moderate" | "severe" | "critical";
  category: "anatomical_variant" | "pathological" | "artifact" | "incidental";
  clinicalSignificance: string;
  possibleCauses: string[];
  requiresFollowUp: boolean;
  isUrgent: boolean;
  measurements?: {
    size?: string;
    dimensions?: string;
    volume?: string;
  };
}

export interface OverallAssessment {
  impression: string;
  severity: "normal" | "mild" | "moderate" | "severe" | "critical";
  urgencyLevel:
    | "routine"
    | "non_urgent"
    | "semi_urgent"
    | "urgent"
    | "emergency";
  keyFindings: string[];
  clinicalCorrelation: string;
}

export interface ScanRecommendation {
  type:
    | "follow_up_imaging"
    | "specialist_referral"
    | "treatment"
    | "monitoring"
    | "lifestyle";
  description: string;
  timeframe: string;
  priority: "low" | "medium" | "high" | "urgent";
  rationale: string;
}

export interface SpecialistReferral {
  specialty: string;
  reason: string;
  urgency: "routine" | "urgent" | "emergency";
  expectedTimeframe: string;
  preparationInstructions?: string[];
}

export interface PatientEducation {
  topic: string;
  explanation: string;
  whatToExpect: string;
  whenToSeekHelp: string[];
}

export class MedicalScanAnalysisService {
  /**
   * Analyze medical scan report and provide comprehensive interpretation
   */
  static analyzeScanReport(
    scanText: string,
    scanType?: string,
    anatomicalRegion?: string
  ): ScanAnalysis {
    // Detect scan type and anatomical region if not provided
    const detectedScanType = scanType || this.detectScanType(scanText);
    const detectedRegion =
      anatomicalRegion || this.detectAnatomicalRegion(scanText);

    // Extract findings from the scan text
    const findings = this.extractFindings(
      scanText,
      detectedScanType,
      detectedRegion
    );

    // Assess overall severity and urgency
    const overallAssessment = this.assessOverallSeverity(findings, scanText);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      findings,
      overallAssessment
    );

    // Determine specialist referrals
    const specialistReferrals = this.determineSpecialistReferrals(
      findings,
      detectedScanType,
      detectedRegion
    );

    // Generate follow-up instructions
    const followUpInstructions = this.generateFollowUpInstructions(
      findings,
      overallAssessment
    );

    // Create patient education materials
    const patientEducation = this.generatePatientEducation(
      findings,
      detectedScanType,
      detectedRegion
    );

    return {
      scanType: detectedScanType,
      anatomicalRegion: detectedRegion,
      findings,
      overallAssessment,
      recommendations,
      specialistReferrals,
      followUpInstructions,
      patientEducation,
    };
  }

  /**
   * Detect scan type from report text
   */
  private static detectScanType(scanText: string): string {
    const text = scanText.toLowerCase();

    const typeKeywords = {
      "x-ray": ["x-ray", "xray", "radiograph", "plain film"],
      ct_scan: ["ct scan", "computed tomography", "cat scan", "ct"],
      mri: ["mri", "magnetic resonance", "mr imaging"],
      ultrasound: ["ultrasound", "sonogram", "doppler", "echo"],
      mammogram: ["mammogram", "mammography", "breast imaging"],
      bone_scan: ["bone scan", "nuclear medicine", "scintigraphy"],
    };

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return type;
      }
    }

    return "unknown";
  }

  /**
   * Detect anatomical region from report text
   */
  private static detectAnatomicalRegion(scanText: string): string {
    const text = scanText.toLowerCase();

    const regionKeywords = {
      chest: ["chest", "thorax", "lung", "heart", "ribs", "sternum"],
      abdomen: [
        "abdomen",
        "abdominal",
        "liver",
        "kidney",
        "spleen",
        "pancreas",
      ],
      pelvis: ["pelvis", "pelvic", "bladder", "prostate", "ovary", "uterus"],
      head: ["head", "brain", "skull", "cranial", "cerebral", "sinus"],
      spine: ["spine", "spinal", "vertebra", "cervical", "thoracic", "lumbar"],
      extremities: [
        "arm",
        "leg",
        "hand",
        "foot",
        "shoulder",
        "hip",
        "knee",
        "ankle",
      ],
    };

    for (const [region, keywords] of Object.entries(regionKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return region;
      }
    }

    return "unknown";
  }

  /**
   * Extract findings from scan text
   */
  private static extractFindings(
    scanText: string,
    scanType: string,
    anatomicalRegion: string
  ): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const text = scanText.toLowerCase();

    // Common finding patterns
    const findingPatterns = [
      // Normal findings
      {
        pattern: /no (acute|significant|obvious) (abnormalities?|findings?)/gi,
        severity: "normal" as const,
        category: "anatomical_variant" as const,
        description: "No significant abnormalities detected",
      },
      // Fractures
      {
        pattern: /fracture/gi,
        severity: "severe" as const,
        category: "pathological" as const,
        description: "Bone fracture identified",
      },
      // Masses/Tumors
      {
        pattern: /(mass|tumor|lesion|nodule)/gi,
        severity: "moderate" as const,
        category: "pathological" as const,
        description: "Mass or lesion detected",
      },
      // Infections
      {
        pattern: /(pneumonia|infection|abscess|cellulitis)/gi,
        severity: "moderate" as const,
        category: "pathological" as const,
        description: "Signs of infection",
      },
      // Degenerative changes
      {
        pattern: /(degenerative|arthritis|osteoarthritis)/gi,
        severity: "mild" as const,
        category: "pathological" as const,
        description: "Degenerative changes noted",
      },
    ];

    // Extract findings based on patterns
    findingPatterns.forEach((pattern, index) => {
      const matches = scanText.match(pattern.pattern);
      if (matches) {
        matches.forEach((match, matchIndex) => {
          const finding: ScanFinding = {
            id: `finding_${index}_${matchIndex}`,
            description: this.enhanceFindingDescription(match, scanText),
            location: this.extractLocation(match, scanText, anatomicalRegion),
            severity: pattern.severity,
            category: pattern.category,
            clinicalSignificance: this.getClinicaSignificance(
              match,
              pattern.severity
            ),
            possibleCauses: this.getPossibleCauses(match, scanType),
            requiresFollowUp: pattern.severity !== "normal",
            isUrgent:
              pattern.severity === "severe" || pattern.severity === "critical",
          };

          findings.push(finding);
        });
      }
    });

    // If no specific findings, add a general assessment
    if (findings.length === 0) {
      findings.push({
        id: "general_assessment",
        description: "Scan reviewed - see detailed report for findings",
        location: anatomicalRegion,
        severity: "normal",
        category: "anatomical_variant",
        clinicalSignificance:
          "Requires clinical correlation with symptoms and examination",
        possibleCauses: [],
        requiresFollowUp: false,
        isUrgent: false,
      });
    }

    return findings;
  }

  /**
   * Enhance finding description with context
   */
  private static enhanceFindingDescription(
    match: string,
    fullText: string
  ): string {
    // Extract surrounding context for better description
    const matchIndex = fullText.toLowerCase().indexOf(match.toLowerCase());
    const contextStart = Math.max(0, matchIndex - 50);
    const contextEnd = Math.min(
      fullText.length,
      matchIndex + match.length + 50
    );
    const context = fullText.substring(contextStart, contextEnd);

    // Clean up and return enhanced description
    return context.trim().replace(/\s+/g, " ");
  }

  /**
   * Extract location information
   */
  private static extractLocation(
    match: string,
    fullText: string,
    defaultRegion: string
  ): string {
    const locationKeywords = {
      right: ["right", "rt", "dextro"],
      left: ["left", "lt", "sinistro"],
      bilateral: ["bilateral", "both", "bilaterally"],
      upper: ["upper", "superior", "cranial"],
      lower: ["lower", "inferior", "caudal"],
      anterior: ["anterior", "front"],
      posterior: ["posterior", "back"],
    };

    const matchIndex = fullText.toLowerCase().indexOf(match.toLowerCase());
    const contextStart = Math.max(0, matchIndex - 30);
    const contextEnd = Math.min(
      fullText.length,
      matchIndex + match.length + 30
    );
    const context = fullText.substring(contextStart, contextEnd).toLowerCase();

    const detectedLocations: string[] = [];

    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some((keyword) => context.includes(keyword))) {
        detectedLocations.push(location);
      }
    }

    return detectedLocations.length > 0
      ? `${detectedLocations.join(" ")} ${defaultRegion}`
      : defaultRegion;
  }

  /**
   * Get clinical significance of finding
   */
  private static getClinicaSignificance(
    finding: string,
    severity: string
  ): string {
    const significanceMap: Record<string, string> = {
      fracture:
        "Bone fracture requires orthopedic evaluation and appropriate immobilization",
      mass: "Mass lesion requires further characterization and possible biopsy",
      pneumonia: "Lung infection requiring antibiotic treatment and monitoring",
      degenerative: "Age-related changes that may contribute to symptoms",
      normal: "No significant pathology identified on imaging",
    };

    const findingLower = finding.toLowerCase();
    for (const [key, significance] of Object.entries(significanceMap)) {
      if (findingLower.includes(key)) {
        return significance;
      }
    }

    return severity === "normal"
      ? "No significant abnormality detected"
      : "Finding requires clinical correlation and possible follow-up";
  }

  /**
   * Get possible causes of finding
   */
  private static getPossibleCauses(
    finding: string,
    scanType: string
  ): string[] {
    const causesMap: Record<string, string[]> = {
      fracture: [
        "trauma",
        "osteoporosis",
        "pathological fracture",
        "stress fracture",
      ],
      mass: ["benign tumor", "malignant tumor", "cyst", "inflammation"],
      pneumonia: [
        "bacterial infection",
        "viral infection",
        "aspiration",
        "immunocompromise",
      ],
      degenerative: [
        "aging",
        "wear and tear",
        "previous injury",
        "genetic factors",
      ],
    };

    const findingLower = finding.toLowerCase();
    for (const [key, causes] of Object.entries(causesMap)) {
      if (findingLower.includes(key)) {
        return causes;
      }
    }

    return [];
  }

  /**
   * Assess overall severity
   */
  private static assessOverallSeverity(
    findings: ScanFinding[],
    scanText: string
  ): OverallAssessment {
    const severities = findings.map((f) => f.severity);
    const maxSeverity = this.getMaxSeverity(severities);

    const urgentFindings = findings.filter((f) => f.isUrgent);
    const significantFindings = findings.filter((f) => f.severity !== "normal");

    const urgencyLevel =
      urgentFindings.length > 0
        ? "urgent"
        : significantFindings.length > 2
        ? "semi_urgent"
        : significantFindings.length > 0
        ? "non_urgent"
        : "routine";

    return {
      impression: this.generateImpression(findings, scanText),
      severity: maxSeverity,
      urgencyLevel,
      keyFindings: significantFindings.slice(0, 3).map((f) => f.description),
      clinicalCorrelation:
        "Findings should be correlated with clinical symptoms and physical examination",
    };
  }

  /**
   * Get maximum severity from list
   */
  private static getMaxSeverity(
    severities: string[]
  ): "normal" | "mild" | "moderate" | "severe" | "critical" {
    const severityOrder = ["normal", "mild", "moderate", "severe", "critical"];
    let maxIndex = 0;

    severities.forEach((severity) => {
      const index = severityOrder.indexOf(severity);
      if (index > maxIndex) {
        maxIndex = index;
      }
    });

    return severityOrder[maxIndex] as any;
  }

  /**
   * Generate overall impression
   */
  private static generateImpression(
    findings: ScanFinding[],
    scanText: string
  ): string {
    const significantFindings = findings.filter((f) => f.severity !== "normal");

    if (significantFindings.length === 0) {
      return "No significant abnormalities detected on imaging";
    }

    if (significantFindings.length === 1) {
      return `Single finding: ${significantFindings[0].description}`;
    }

    return `Multiple findings identified including ${significantFindings
      .slice(0, 2)
      .map((f) => f.description.toLowerCase())
      .join(" and ")}`;
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    findings: ScanFinding[],
    assessment: OverallAssessment
  ): ScanRecommendation[] {
    const recommendations: ScanRecommendation[] = [];

    // Urgent findings
    const urgentFindings = findings.filter((f) => f.isUrgent);
    if (urgentFindings.length > 0) {
      recommendations.push({
        type: "specialist_referral",
        description: "Immediate specialist consultation for urgent findings",
        timeframe: "Within 24-48 hours",
        priority: "urgent",
        rationale: "Urgent findings require prompt medical evaluation",
      });
    }

    // Follow-up imaging
    const findingsNeedingFollowUp = findings.filter(
      (f) => f.requiresFollowUp && !f.isUrgent
    );
    if (findingsNeedingFollowUp.length > 0) {
      recommendations.push({
        type: "follow_up_imaging",
        description: "Follow-up imaging to monitor findings",
        timeframe: "3-6 months",
        priority: "medium",
        rationale: "Monitor progression or resolution of identified findings",
      });
    }

    // Clinical correlation
    recommendations.push({
      type: "monitoring",
      description: "Correlate findings with clinical symptoms and examination",
      timeframe: "At next clinical visit",
      priority: "medium",
      rationale: "Imaging findings should be interpreted in clinical context",
    });

    return recommendations;
  }

  /**
   * Determine specialist referrals
   */
  private static determineSpecialistReferrals(
    findings: ScanFinding[],
    scanType: string,
    anatomicalRegion: string
  ): SpecialistReferral[] {
    const referrals: SpecialistReferral[] = [];

    // Determine appropriate specialists based on findings and region
    const specialtyMap: Record<
      string,
      { specialty: string; conditions: string[] }
    > = {
      orthopedics: {
        specialty: "Orthopedic Surgery",
        conditions: ["fracture", "joint", "bone", "spine"],
      },
      neurology: {
        specialty: "Neurology",
        conditions: ["brain", "stroke", "neurological", "spinal cord"],
      },
      oncology: {
        specialty: "Oncology",
        conditions: ["mass", "tumor", "lesion", "metastasis"],
      },
      pulmonology: {
        specialty: "Pulmonology",
        conditions: ["lung", "pneumonia", "chest", "respiratory"],
      },
      cardiology: {
        specialty: "Cardiology",
        conditions: ["heart", "cardiac", "aortic", "vascular"],
      },
    };

    const urgentFindings = findings.filter((f) => f.isUrgent);
    const significantFindings = findings.filter(
      (f) => f.severity === "moderate" || f.severity === "severe"
    );

    // Check for specialist needs based on findings
    Object.entries(specialtyMap).forEach(([key, { specialty, conditions }]) => {
      const relevantFindings = findings.filter((f) =>
        conditions.some(
          (condition) =>
            f.description.toLowerCase().includes(condition) ||
            f.location.toLowerCase().includes(condition)
        )
      );

      if (relevantFindings.length > 0) {
        const hasUrgent = relevantFindings.some((f) => f.isUrgent);

        referrals.push({
          specialty,
          reason: `Evaluation of ${relevantFindings
            .map((f) => f.description)
            .join(", ")}`,
          urgency: hasUrgent ? "urgent" : "routine",
          expectedTimeframe: hasUrgent ? "24-48 hours" : "2-4 weeks",
          preparationInstructions: this.getPreparationInstructions(specialty),
        });
      }
    });

    return referrals;
  }

  /**
   * Get preparation instructions for specialist visits
   */
  private static getPreparationInstructions(specialty: string): string[] {
    const instructionsMap: Record<string, string[]> = {
      "Orthopedic Surgery": [
        "Bring all imaging studies and reports",
        "List current medications and allergies",
        "Prepare questions about treatment options",
      ],
      Neurology: [
        "Keep a symptom diary",
        "Bring list of all medications",
        "Prepare detailed medical history",
      ],
      Oncology: [
        "Gather all previous imaging and pathology reports",
        "Bring a support person if possible",
        "Prepare list of questions about diagnosis and treatment",
      ],
    };

    return (
      instructionsMap[specialty] || [
        "Bring all relevant medical records",
        "List current medications and allergies",
        "Prepare questions for the specialist",
      ]
    );
  }

  /**
   * Generate follow-up instructions
   */
  private static generateFollowUpInstructions(
    findings: ScanFinding[],
    assessment: OverallAssessment
  ): string[] {
    const instructions: string[] = [];

    if (
      assessment.urgencyLevel === "urgent" ||
      assessment.urgencyLevel === "emergency"
    ) {
      instructions.push("Seek immediate medical attention for urgent findings");
      instructions.push(
        "Contact your healthcare provider immediately to discuss results"
      );
    }

    if (findings.some((f) => f.requiresFollowUp)) {
      instructions.push("Schedule follow-up appointment to discuss findings");
      instructions.push("Monitor symptoms and report any changes");
    }

    instructions.push(
      "Keep copies of all imaging reports for future reference"
    );
    instructions.push(
      "Discuss any questions or concerns with your healthcare provider"
    );

    if (assessment.severity !== "normal") {
      instructions.push("Follow prescribed treatment plan if applicable");
      instructions.push("Attend all recommended follow-up appointments");
    }

    return instructions;
  }

  /**
   * Generate patient education materials
   */
  private static generatePatientEducation(
    findings: ScanFinding[],
    scanType: string,
    anatomicalRegion: string
  ): PatientEducation[] {
    const education: PatientEducation[] = [];

    // General scan education
    const scanInfo = SCAN_TYPES[scanType as keyof typeof SCAN_TYPES];
    if (scanInfo) {
      education.push({
        topic: `Understanding Your ${scanInfo.name}`,
        explanation: scanInfo.description,
        whatToExpected:
          "Your scan has been reviewed by a radiologist who specializes in interpreting medical images",
        whenToSeekHelp: [
          "If you develop new or worsening symptoms",
          "If you have questions about your results",
          "If recommended follow-up is not scheduled",
        ],
      });
    }

    // Specific finding education
    const significantFindings = findings.filter((f) => f.severity !== "normal");
    significantFindings.forEach((finding) => {
      education.push({
        topic: `Understanding Your Finding: ${finding.description}`,
        explanation: finding.clinicalSignificance,
        whatToExpected: finding.requiresFollowUp
          ? "This finding may require additional evaluation or monitoring"
          : "This finding is noted but may not require immediate action",
        whenToSeekHelp: finding.isUrgent
          ? [
              "Seek immediate medical attention",
              "Contact your healthcare provider right away",
            ]
          : [
              "Discuss with your healthcare provider at your next visit",
              "Follow recommended follow-up schedule",
            ],
      });
    });

    return education;
  }
}
