import { db } from "@/lib/db";
import {
  users,
  medicalSummaries,
  notifications,
  notificationPreferences,
  healthEvents,
  medications,
} from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { notificationService } from "./notification-service";
import { addMinutes, addHours } from "date-fns";

export interface CriticalHealthIndicator {
  type:
    | "lab_result"
    | "vital_sign"
    | "medication_interaction"
    | "symptom"
    | "ai_analysis";
  severity: "high" | "critical";
  finding: string;
  recommendation: string;
  source: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary?: boolean;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  indicator: CriticalHealthIndicator;
  alertLevel: "urgent" | "critical" | "emergency";
  sentAt: Date;
  acknowledgedAt?: Date;
  escalatedAt?: Date;
  emergencyContactsNotified: boolean;
  metadata: Record<string, any>;
}

export interface EscalationRule {
  alertLevel: "urgent" | "critical" | "emergency";
  timeoutMinutes: number;
  escalateToEmergencyContacts: boolean;
  escalateToHealthcareProvider: boolean;
  requireAcknowledgment: boolean;
}

export class EmergencyAlertService {
  private static instance: EmergencyAlertService;

  private constructor() {}

  public static getInstance(): EmergencyAlertService {
    if (!EmergencyAlertService.instance) {
      EmergencyAlertService.instance = new EmergencyAlertService();
    }
    return EmergencyAlertService.instance;
  }

  /**
   * Analyze medical data for critical health indicators
   */
  async analyzeCriticalHealthIndicators(
    userId: string,
    recordId?: string
  ): Promise<CriticalHealthIndicator[]> {
    const indicators: CriticalHealthIndicator[] = [];

    try {
      // Get recent medical summaries for analysis
      const recentSummaries = await db
        .select()
        .from(medicalSummaries)
        .where(
          recordId
            ? eq(medicalSummaries.recordId, recordId)
            : eq(medicalSummaries.userId, userId)
        )
        .orderBy(desc(medicalSummaries.createdAt))
        .limit(recordId ? 1 : 10);

      // Analyze each summary for critical indicators
      for (const summary of recentSummaries) {
        const summaryIndicators = await this.analyzeMedicalSummary(summary);
        indicators.push(...summaryIndicators);
      }

      // Check for medication interactions
      const medicationIndicators = await this.checkMedicationInteractions(
        userId
      );
      indicators.push(...medicationIndicators);

      // Check recent health events for critical symptoms
      const symptomIndicators = await this.checkCriticalSymptoms(userId);
      indicators.push(...symptomIndicators);

      return indicators;
    } catch (error) {
      console.error("Error analyzing critical health indicators:", error);
      throw error;
    }
  }

  /**
   * Create and send emergency alert
   */
  async createEmergencyAlert(
    userId: string,
    indicator: CriticalHealthIndicator,
    alertLevel: "urgent" | "critical" | "emergency" = "critical"
  ): Promise<EmergencyAlert> {
    try {
      // Get user details and emergency contacts
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error("User not found");
      }

      const userData = user[0];
      const emergencyContacts = userData.emergencyContact
        ? [userData.emergencyContact]
        : [];

      // Create alert record
      const alertId = crypto.randomUUID();
      const alert: EmergencyAlert = {
        id: alertId,
        userId,
        indicator,
        alertLevel,
        sentAt: new Date(),
        emergencyContactsNotified: false,
        metadata: {
          userEmail: userData.email,
          userPhone: userData.phoneNumber,
          emergencyContacts,
        },
      };

      // Send immediate notification to user
      await this.sendEmergencyNotificationToUser(
        userData,
        indicator,
        alertLevel
      );

      // Send notifications to emergency contacts if critical or emergency level
      if (alertLevel === "critical" || alertLevel === "emergency") {
        await this.notifyEmergencyContacts(
          userData,
          emergencyContacts,
          indicator,
          alertLevel
        );
        alert.emergencyContactsNotified = true;
      }

      // Store alert in database
      await db.insert(notifications).values({
        userId,
        type: "critical_alert",
        title: "CRITICAL HEALTH ALERT",
        message: indicator.finding,
        scheduledFor: new Date(),
        sentAt: new Date(),
        channels: {
          email: true,
          sms: alertLevel === "emergency",
          push: true,
        },
        metadata: {
          alertId,
          alertLevel,
          indicator,
          emergencyContactsNotified: alert.emergencyContactsNotified,
        },
      });

      // Set up escalation if required
      await this.setupEscalation(alert);

      return alert;
    } catch (error) {
      console.error("Error creating emergency alert:", error);
      throw error;
    }
  }

  /**
   * Process unacknowledged alerts and escalate if necessary
   */
  async processEscalations(): Promise<void> {
    try {
      const escalationRules = this.getEscalationRules();
      const now = new Date();

      // Get unacknowledged critical alerts
      const unacknowledgedAlerts = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.type, "critical_alert"),
            eq(notifications.isRead, false)
          )
        );

      for (const alert of unacknowledgedAlerts) {
        const alertMetadata = alert.metadata as any;
        const alertLevel = alertMetadata.alertLevel;
        const rule = escalationRules.find((r) => r.alertLevel === alertLevel);

        if (!rule) continue;

        const alertTime = new Date(alert.sentAt || alert.createdAt);
        const timeoutTime = addMinutes(alertTime, rule.timeoutMinutes);

        // Check if alert has timed out
        if (now > timeoutTime && !alertMetadata.escalated) {
          await this.escalateAlert(alert, rule);
        }
      }
    } catch (error) {
      console.error("Error processing escalations:", error);
      throw error;
    }
  }

  /**
   * Create emergency profile for quick access
   */
  async createEmergencyProfile(userId: string): Promise<any> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error("User not found");
      }

      const userData = user[0];

      // Get current medications
      const currentMedications = await db
        .select()
        .from(medications)
        .where(
          and(eq(medications.userId, userId), eq(medications.isActive, true))
        );

      // Get recent critical health events
      const recentCriticalEvents = await db
        .select()
        .from(healthEvents)
        .where(
          and(
            eq(healthEvents.userId, userId),
            eq(healthEvents.severity, "critical")
          )
        )
        .orderBy(desc(healthEvents.eventDate))
        .limit(5);

      const emergencyProfile = {
        id: userId,
        personalInfo: {
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
        },
        medicalInfo: {
          allergies: userData.medicalHistory?.allergies || [],
          chronicConditions: userData.medicalHistory?.chronicConditions || [],
          bloodType: userData.medicalHistory?.bloodType,
          currentMedications: currentMedications.map((med) => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            instructions: med.instructions,
          })),
        },
        emergencyContact: userData.emergencyContact,
        recentCriticalEvents: recentCriticalEvents.map((event) => ({
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          severity: event.severity,
        })),
        lastUpdated: new Date(),
      };

      return emergencyProfile;
    } catch (error) {
      console.error("Error creating emergency profile:", error);
      throw error;
    }
  }

  /**
   * Analyze medical summary for critical indicators
   */
  private async analyzeMedicalSummary(
    summary: any
  ): Promise<CriticalHealthIndicator[]> {
    const indicators: CriticalHealthIndicator[] = [];

    // Check urgency level
    if (summary.urgencyLevel === "critical") {
      indicators.push({
        type: "ai_analysis",
        severity: "critical",
        finding: summary.summary,
        recommendation: "Seek immediate medical attention",
        source: `AI Analysis (${summary.aiModel})`,
        confidence: parseFloat(summary.confidence),
        metadata: {
          summaryId: summary.id,
          recordId: summary.recordId,
        },
      });
    }

    // Check lab results for critical values
    if (summary.extractedData?.labResults) {
      for (const labResult of summary.extractedData.labResults) {
        if (labResult.isAbnormal && this.isCriticalLabValue(labResult)) {
          indicators.push({
            type: "lab_result",
            severity: "critical",
            finding: `Critical lab value: ${labResult.testName} = ${
              labResult.value
            } ${labResult.unit || ""}`,
            recommendation: "Contact your healthcare provider immediately",
            source: "Lab Results Analysis",
            metadata: {
              testName: labResult.testName,
              value: labResult.value,
              unit: labResult.unit,
              referenceRange: labResult.referenceRange,
            },
          });
        }
      }
    }

    // Check risk factors
    if (summary.riskFactors) {
      for (const riskFactor of summary.riskFactors) {
        if (riskFactor.severity === "high") {
          indicators.push({
            type: "ai_analysis",
            severity: "high",
            finding: `High risk factor identified: ${riskFactor.factor}`,
            recommendation: riskFactor.description,
            source: "Risk Factor Analysis",
            metadata: {
              riskFactor: riskFactor.factor,
              severity: riskFactor.severity,
            },
          });
        }
      }
    }

    return indicators;
  }

  /**
   * Check for dangerous medication interactions
   */
  private async checkMedicationInteractions(
    userId: string
  ): Promise<CriticalHealthIndicator[]> {
    const indicators: CriticalHealthIndicator[] = [];

    try {
      const activeMedications = await db
        .select()
        .from(medications)
        .where(
          and(eq(medications.userId, userId), eq(medications.isActive, true))
        );

      // Check for known dangerous interactions
      for (let i = 0; i < activeMedications.length; i++) {
        for (let j = i + 1; j < activeMedications.length; j++) {
          const med1 = activeMedications[i];
          const med2 = activeMedications[j];

          const interaction = this.checkDrugInteraction(med1.name, med2.name);
          if (interaction && interaction.severity === "critical") {
            indicators.push({
              type: "medication_interaction",
              severity: "critical",
              finding: `Critical drug interaction detected between ${med1.name} and ${med2.name}`,
              recommendation:
                "Contact your healthcare provider immediately to review medications",
              source: "Medication Interaction Check",
              metadata: {
                medication1: med1.name,
                medication2: med2.name,
                interaction: interaction.description,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking medication interactions:", error);
    }

    return indicators;
  }

  /**
   * Check for critical symptoms in recent health events
   */
  private async checkCriticalSymptoms(
    userId: string
  ): Promise<CriticalHealthIndicator[]> {
    const indicators: CriticalHealthIndicator[] = [];

    try {
      const recentEvents = await db
        .select()
        .from(healthEvents)
        .where(
          and(
            eq(healthEvents.userId, userId),
            gte(
              healthEvents.eventDate,
              new Date(Date.now() - 24 * 60 * 60 * 1000)
            ) // Last 24 hours
          )
        );

      for (const event of recentEvents) {
        if (this.isCriticalSymptom(event.title, event.description)) {
          indicators.push({
            type: "symptom",
            severity: "critical",
            finding: `Critical symptom reported: ${event.title}`,
            recommendation: "Seek immediate medical attention",
            source: "Symptom Monitoring",
            metadata: {
              eventId: event.id,
              symptom: event.title,
              description: event.description,
              eventDate: event.eventDate,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error checking critical symptoms:", error);
    }

    return indicators;
  }

  /**
   * Send emergency notification to user
   */
  private async sendEmergencyNotificationToUser(
    user: any,
    indicator: CriticalHealthIndicator,
    alertLevel: string
  ): Promise<void> {
    const channels = [];

    if (user.email) {
      channels.push({
        type: "email" as const,
        enabled: true,
        address: user.email,
      });
    }

    if (user.phoneNumber && alertLevel === "emergency") {
      channels.push({
        type: "sms" as const,
        enabled: true,
        address: user.phoneNumber,
      });
    }

    channels.push({
      type: "push" as const,
      enabled: true,
    });

    const templates = notificationService.getDefaultTemplates();
    const template = templates.find((t) => t.type === "critical_alert");

    if (template) {
      await notificationService.sendMultiChannelNotification(
        {
          userId: user.id,
          type: "critical_alert",
          priority: "critical",
          data: {
            patientName: user.fullName || "Patient",
            finding: indicator.finding,
            recommendation: indicator.recommendation,
          },
        },
        channels,
        template
      );
    }
  }

  /**
   * Notify emergency contacts
   */
  private async notifyEmergencyContacts(
    user: any,
    emergencyContacts: EmergencyContact[],
    indicator: CriticalHealthIndicator,
    alertLevel: string
  ): Promise<void> {
    for (const contact of emergencyContacts) {
      const channels = [];

      if (contact.email) {
        channels.push({
          type: "email" as const,
          enabled: true,
          address: contact.email,
        });
      }

      if (contact.phoneNumber) {
        channels.push({
          type: "sms" as const,
          enabled: true,
          address: contact.phoneNumber,
        });
      }

      if (channels.length > 0) {
        await notificationService.sendMultiChannelNotification(
          {
            userId: user.id,
            type: "critical_alert",
            priority: "critical",
            data: {
              patientName: user.fullName || "Patient",
              contactName: contact.name,
              relationship: contact.relationship,
              finding: indicator.finding,
              recommendation: indicator.recommendation,
              alertLevel,
            },
          },
          channels,
          {
            id: "emergency_contact_alert",
            name: "Emergency Contact Alert",
            type: "critical_alert",
            channels: ["email", "sms"],
            subject: `URGENT: Health Alert for ${user.fullName || "Patient"}`,
            emailTemplate: `
              <h2 style="color: red;">URGENT HEALTH ALERT</h2>
              <p>Dear {{ contactName }},</p>
              <p>This is an urgent health alert for {{ patientName }} ({{ relationship }}).</p>
              <p><strong>Critical Finding:</strong> {{ finding }}</p>
              <p><strong>Recommendation:</strong> {{ recommendation }}</p>
              <p><strong>Alert Level:</strong> {{ alertLevel }}</p>
              <p style="color: red; font-weight: bold;">Please contact {{ patientName }} immediately or assist them in seeking medical attention.</p>
              <p>This alert was generated by InfoRx Emergency Alert System.</p>
            `,
            smsTemplate:
              "URGENT: Health alert for {{ patientName }}. {{ finding }}. Please contact them immediately. - InfoRx",
          }
        );
      }
    }
  }

  /**
   * Set up escalation for unacknowledged alerts
   */
  private async setupEscalation(alert: EmergencyAlert): Promise<void> {
    const rules = this.getEscalationRules();
    const rule = rules.find((r) => r.alertLevel === alert.alertLevel);

    if (rule && rule.requireAcknowledgment) {
      // Schedule escalation check
      setTimeout(async () => {
        await this.checkAndEscalateAlert(alert.id);
      }, rule.timeoutMinutes * 60 * 1000);
    }
  }

  /**
   * Check and escalate alert if not acknowledged
   */
  private async checkAndEscalateAlert(alertId: string): Promise<void> {
    try {
      const alert = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, alertId))
        .limit(1);

      if (alert.length && !alert[0].isRead) {
        const rule = this.getEscalationRules().find(
          (r) => r.alertLevel === (alert[0].metadata as any).alertLevel
        );

        if (rule) {
          await this.escalateAlert(alert[0], rule);
        }
      }
    } catch (error) {
      console.error("Error checking alert for escalation:", error);
    }
  }

  /**
   * Escalate unacknowledged alert
   */
  private async escalateAlert(alert: any, rule: EscalationRule): Promise<void> {
    try {
      const alertMetadata = alert.metadata as any;

      // Mark as escalated
      await db
        .update(notifications)
        .set({
          metadata: {
            ...alertMetadata,
            escalated: true,
            escalatedAt: new Date(),
          },
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, alert.id));

      // Send escalation notifications
      if (rule.escalateToEmergencyContacts && alertMetadata.emergencyContacts) {
        // Send additional notifications to emergency contacts
        console.log("Escalating to emergency contacts for alert:", alert.id);
      }

      if (rule.escalateToHealthcareProvider) {
        // Send notification to healthcare provider (if configured)
        console.log("Escalating to healthcare provider for alert:", alert.id);
      }
    } catch (error) {
      console.error("Error escalating alert:", error);
    }
  }

  /**
   * Get escalation rules
   */
  private getEscalationRules(): EscalationRule[] {
    return [
      {
        alertLevel: "urgent",
        timeoutMinutes: 60,
        escalateToEmergencyContacts: false,
        escalateToHealthcareProvider: false,
        requireAcknowledgment: true,
      },
      {
        alertLevel: "critical",
        timeoutMinutes: 30,
        escalateToEmergencyContacts: true,
        escalateToHealthcareProvider: false,
        requireAcknowledgment: true,
      },
      {
        alertLevel: "emergency",
        timeoutMinutes: 15,
        escalateToEmergencyContacts: true,
        escalateToHealthcareProvider: true,
        requireAcknowledgment: true,
      },
    ];
  }

  /**
   * Check if lab value is critical
   */
  private isCriticalLabValue(labResult: any): boolean {
    const criticalValues: Record<string, { min?: number; max?: number }> = {
      glucose: { min: 40, max: 400 },
      potassium: { min: 2.5, max: 6.0 },
      sodium: { min: 120, max: 160 },
      creatinine: { max: 3.0 },
      hemoglobin: { min: 7.0 },
      platelet: { min: 50000 },
      "white blood cell": { min: 2000, max: 30000 },
    };

    const testName = labResult.testName.toLowerCase();
    const value = parseFloat(labResult.value);

    if (isNaN(value)) return false;

    for (const [test, limits] of Object.entries(criticalValues)) {
      if (testName.includes(test)) {
        if (limits.min && value < limits.min) return true;
        if (limits.max && value > limits.max) return true;
      }
    }

    return false;
  }

  /**
   * Check for drug interactions
   */
  private checkDrugInteraction(
    drug1: string,
    drug2: string
  ): { severity: string; description: string } | null {
    // Simplified drug interaction check
    // In production, this would use a comprehensive drug interaction database
    const criticalInteractions = [
      {
        drugs: ["warfarin", "aspirin"],
        description: "Increased bleeding risk",
      },
      {
        drugs: ["digoxin", "furosemide"],
        description: "Increased digoxin toxicity risk",
      },
      {
        drugs: ["metformin", "contrast"],
        description: "Risk of lactic acidosis",
      },
    ];

    const drug1Lower = drug1.toLowerCase();
    const drug2Lower = drug2.toLowerCase();

    for (const interaction of criticalInteractions) {
      if (
        (interaction.drugs.some((d) => drug1Lower.includes(d)) &&
          interaction.drugs.some((d) => drug2Lower.includes(d))) ||
        (interaction.drugs.some((d) => drug2Lower.includes(d)) &&
          interaction.drugs.some((d) => drug1Lower.includes(d)))
      ) {
        return {
          severity: "critical",
          description: interaction.description,
        };
      }
    }

    return null;
  }

  /**
   * Check if symptom is critical
   */
  private isCriticalSymptom(title: string, description?: string): boolean {
    const criticalSymptoms = [
      "chest pain",
      "difficulty breathing",
      "severe headache",
      "loss of consciousness",
      "severe abdominal pain",
      "stroke symptoms",
      "heart attack",
      "seizure",
      "severe allergic reaction",
      "uncontrolled bleeding",
    ];

    const text = `${title} ${description || ""}`.toLowerCase();

    return criticalSymptoms.some((symptom) => text.includes(symptom));
  }
}

export const emergencyAlertService = EmergencyAlertService.getInstance();
