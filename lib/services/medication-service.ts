export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  reminderTimes: string[];
  sideEffects: string[];
  interactions: string[];
  recordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  reminderTimes?: string[];
  sideEffects?: string[];
  interactions?: string[];
  recordId?: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  taken: boolean;
  date: string;
}

export interface MedicationSchedule {
  medication: Medication;
  nextDose: Date | null;
  missedDoses: number;
  adherenceRate: number;
  reminders: MedicationReminder[];
}

export interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
}

export class MedicationService {
  private baseUrl = "/api/medications";

  /**
   * Fetch all medications for the current user
   */
  async getMedications(activeOnly: boolean = false): Promise<Medication[]> {
    const params = new URLSearchParams();
    if (activeOnly) {
      params.append("active", "true");
    }

    const url = `${this.baseUrl}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch medications");
    }

    const data = await response.json();
    return data.medications;
  }

  /**
   * Get a specific medication by ID
   */
  async getMedication(id: string): Promise<Medication> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch medication");
    }

    const data = await response.json();
    return data.medication;
  }

  /**
   * Create a new medication
   */
  async createMedication(
    medicationData: MedicationFormData
  ): Promise<Medication> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(medicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create medication");
    }

    const data = await response.json();
    return data.medication;
  }

  /**
   * Update an existing medication
   */
  async updateMedication(
    id: string,
    updates: Partial<MedicationFormData>
  ): Promise<Medication> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update medication");
    }

    const data = await response.json();
    return data.medication;
  }

  /**
   * Delete a medication
   */
  async deleteMedication(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete medication");
    }
  }

  /**
   * Parse medication schedule from prescription text
   */
  static parseMedicationSchedule(
    prescriptionText: string
  ): Partial<MedicationFormData>[] {
    const medications: Partial<MedicationFormData>[] = [];

    // Common medication patterns
    const patterns = [
      // Pattern: "Medication Name 500mg twice daily"
      /([A-Za-z\s]+)\s+(\d+(?:\.\d+)?(?:mg|g|ml|mcg))\s+(.*?)(?:daily|per day|a day)/gi,
      // Pattern: "Take Medication 2 tablets every 8 hours"
      /take\s+([A-Za-z\s]+)\s+(\d+\s+(?:tablet|capsule|pill)s?)\s+(.*)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(prescriptionText)) !== null) {
        const [, name, dosage, frequency] = match;

        medications.push({
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: this.parseFrequency(frequency.trim()),
        });
      }
    }

    return medications;
  }

  /**
   * Parse frequency text into standardized format
   */
  private static parseFrequency(frequencyText: string): string {
    const text = frequencyText.toLowerCase();

    if (
      text.includes("once") ||
      text.includes("1 time") ||
      text.includes("daily")
    ) {
      return "Once daily";
    }
    if (
      text.includes("twice") ||
      text.includes("2 times") ||
      text.includes("bid")
    ) {
      return "Twice daily";
    }
    if (
      text.includes("three times") ||
      text.includes("3 times") ||
      text.includes("tid")
    ) {
      return "Three times daily";
    }
    if (
      text.includes("four times") ||
      text.includes("4 times") ||
      text.includes("qid")
    ) {
      return "Four times daily";
    }
    if (text.includes("every 4 hours")) {
      return "Every 4 hours";
    }
    if (text.includes("every 6 hours")) {
      return "Every 6 hours";
    }
    if (text.includes("every 8 hours")) {
      return "Every 8 hours";
    }
    if (text.includes("every 12 hours")) {
      return "Every 12 hours";
    }
    if (text.includes("as needed") || text.includes("prn")) {
      return "As needed";
    }

    return frequencyText; // Return original if no pattern matches
  }

  /**
   * Generate reminder times based on frequency
   */
  static generateReminderTimes(
    frequency: string,
    startTime: string = "08:00"
  ): string[] {
    const times: string[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);

    switch (frequency.toLowerCase()) {
      case "once daily":
        times.push(startTime);
        break;

      case "twice daily":
        times.push(startTime);
        times.push(this.addHours(startTime, 12));
        break;

      case "three times daily":
        times.push(startTime);
        times.push(this.addHours(startTime, 8));
        times.push(this.addHours(startTime, 16));
        break;

      case "four times daily":
        times.push(startTime);
        times.push(this.addHours(startTime, 6));
        times.push(this.addHours(startTime, 12));
        times.push(this.addHours(startTime, 18));
        break;

      case "every 4 hours":
        for (let i = 0; i < 6; i++) {
          times.push(this.addHours(startTime, i * 4));
        }
        break;

      case "every 6 hours":
        for (let i = 0; i < 4; i++) {
          times.push(this.addHours(startTime, i * 6));
        }
        break;

      case "every 8 hours":
        for (let i = 0; i < 3; i++) {
          times.push(this.addHours(startTime, i * 8));
        }
        break;

      case "every 12 hours":
        times.push(startTime);
        times.push(this.addHours(startTime, 12));
        break;

      default:
        times.push(startTime); // Default to once daily
    }

    return times.filter((time) => time !== null);
  }

  /**
   * Add hours to a time string
   */
  private static addHours(timeString: string, hours: number): string {
    const [hour, minute] = timeString.split(":").map(Number);
    const newHour = (hour + hours) % 24;
    return `${newHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Check for drug interactions
   */
  static checkDrugInteractions(medications: Medication[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];

    // Common drug interaction patterns (simplified)
    const interactionDatabase = [
      {
        drugs: ["warfarin", "aspirin"],
        severity: "severe" as const,
        description: "Increased risk of bleeding",
        recommendation: "Monitor INR closely and watch for signs of bleeding",
      },
      {
        drugs: ["metformin", "alcohol"],
        severity: "moderate" as const,
        description: "Increased risk of lactic acidosis",
        recommendation: "Limit alcohol consumption",
      },
      {
        drugs: ["lisinopril", "potassium"],
        severity: "moderate" as const,
        description: "Risk of hyperkalemia",
        recommendation: "Monitor potassium levels regularly",
      },
    ];

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase();
        const med2 = medications[j].name.toLowerCase();

        for (const interaction of interactionDatabase) {
          if (
            (interaction.drugs.some((drug) => med1.includes(drug)) &&
              interaction.drugs.some((drug) => med2.includes(drug))) ||
            (interaction.drugs.some((drug) => med2.includes(drug)) &&
              interaction.drugs.some((drug) => med1.includes(drug)))
          ) {
            interactions.push({
              medication1: medications[i].name,
              medication2: medications[j].name,
              severity: interaction.severity,
              description: interaction.description,
              recommendation: interaction.recommendation,
            });
          }
        }
      }
    }

    return interactions;
  }

  /**
   * Calculate medication adherence rate
   */
  static calculateAdherenceRate(
    medication: Medication,
    takenDoses: number,
    totalExpectedDoses: number
  ): number {
    if (totalExpectedDoses === 0) return 0;
    return Math.round((takenDoses / totalExpectedDoses) * 100);
  }

  /**
   * Get next dose time for a medication
   */
  static getNextDoseTime(medication: Medication): Date | null {
    if (!medication.isActive || medication.reminderTimes.length === 0) {
      return null;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Find next reminder time today
    for (const time of medication.reminderTimes.sort()) {
      const [hours, minutes] = time.split(":").map(Number);
      const reminderTime = new Date(now);
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime > now) {
        return reminderTime;
      }
    }

    // If no more times today, get first time tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = medication.reminderTimes[0].split(":").map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);

    return tomorrow;
  }
}

// Export singleton instance
export const medicationService = new MedicationService();
