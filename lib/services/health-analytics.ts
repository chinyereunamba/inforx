import { db } from "@/lib/db";
import { medicalRecords, medications, medicalSummaries } from "@/lib/db/schema";
import { eq, and, gte, lte, count, desc, sql } from "drizzle-orm";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
} from "date-fns";

export interface HealthMetrics {
  totalRecords: number;
  activeMedications: number;
  totalNotifications: number;
  unreadNotifications: number;
  recentRecords: number;
  healthScore: number;
  healthScoreFactors: {
    recordsUploaded: number;
    medicationCompliance: number;
    recentActivity: number;
    dataCompleteness: number;
  };
  trends: {
    records: number;
    medications: number;
    healthScore: number;
    notifications: number;
  };
  recordsByType: Record<string, number>;
  monthlyData: Array<{
    month: string;
    records: number;
    medications: number;
  }>;
}

export interface HealthTrend {
  period: string;
  value: number;
  change: number;
  type: "records" | "medications" | "health_score" | "compliance";
}

export interface ComplianceMetrics {
  medicationAdherence: number;
  appointmentAttendance: number;
  recordUploadFrequency: number;
  overallCompliance: number;
}

export class HealthAnalyticsService {
  /**
   * Calculate health score based on various factors
   */
  static calculateHealthScore(factors: {
    totalRecords: number;
    activeMedications: number;
    recentActivity: number;
    hasEmergencyContact: boolean;
    hasMedicalHistory: boolean;
  }): { score: number; breakdown: Record<string, number> } {
    const breakdown = {
      recordsUploaded: Math.min(factors.totalRecords * 2, 30), // Max 30 points
      medicationTracking: Math.min(factors.activeMedications * 5, 25), // Max 25 points
      recentActivity: Math.min(factors.recentActivity * 3, 20), // Max 20 points
      profileCompleteness:
        (factors.hasEmergencyContact ? 10 : 0) +
        (factors.hasMedicalHistory ? 15 : 0), // Max 25 points
    };

    const score = Math.min(
      Object.values(breakdown).reduce((sum, points) => sum + points, 0),
      100
    );

    return { score, breakdown };
  }

  /**
   * Analyze health trends over time
   */
  static async analyzeHealthTrends(
    userId: string,
    months: number = 6
  ): Promise<HealthTrend[]> {
    const now = new Date();
    const startDate = subMonths(now, months);

    // Get monthly record counts
    const monthlyRecords = await db
      .select({
        month: sql<string>`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.userId, userId),
          gte(medicalRecords.createdAt, startDate)
        )
      )
      .groupBy(sql`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`);

    // Calculate trends
    const trends: HealthTrend[] = [];

    for (let i = 1; i < monthlyRecords.length; i++) {
      const current = monthlyRecords[i];
      const previous = monthlyRecords[i - 1];

      const change =
        previous.count > 0
          ? ((current.count - previous.count) / previous.count) * 100
          : current.count > 0
          ? 100
          : 0;

      trends.push({
        period: current.month,
        value: current.count,
        change: Math.round(change),
        type: "records",
      });
    }

    return trends;
  }

  /**
   * Calculate medication compliance metrics
   */
  static async calculateComplianceMetrics(
    userId: string
  ): Promise<ComplianceMetrics> {
    // Get active medications
    const activeMedications = await db
      .select()
      .from(medications)
      .where(
        and(eq(medications.userId, userId), eq(medications.isActive, true))
      );

    // Calculate medication adherence (simplified - would need actual tracking data)
    const medicationAdherence =
      activeMedications.length > 0
        ? Math.min(85 + Math.random() * 15, 100) // Placeholder calculation
        : 0;

    // Calculate record upload frequency
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRecords = await db
      .select({ count: count() })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.userId, userId),
          gte(medicalRecords.createdAt, thirtyDaysAgo)
        )
      );

    const recordUploadFrequency = Math.min(
      (recentRecords[0].count / 30) * 100,
      100
    );

    // Placeholder for appointment attendance (would need appointments table)
    const appointmentAttendance = 80 + Math.random() * 20;

    const overallCompliance =
      medicationAdherence * 0.4 +
      appointmentAttendance * 0.3 +
      recordUploadFrequency * 0.3;

    return {
      medicationAdherence: Math.round(medicationAdherence),
      appointmentAttendance: Math.round(appointmentAttendance),
      recordUploadFrequency: Math.round(recordUploadFrequency),
      overallCompliance: Math.round(overallCompliance),
    };
  }

  /**
   * Get comparative analysis between time periods
   */
  static async getComparativeAnalysis(
    userId: string,
    currentPeriodDays: number = 30
  ): Promise<{
    current: { records: number; medications: number };
    previous: { records: number; medications: number };
    changes: { records: number; medications: number };
  }> {
    const now = new Date();
    const currentStart = new Date(
      now.getTime() - currentPeriodDays * 24 * 60 * 60 * 1000
    );
    const previousStart = new Date(
      currentStart.getTime() - currentPeriodDays * 24 * 60 * 60 * 1000
    );

    const [currentRecords, previousRecords] = await Promise.all([
      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.userId, userId),
            gte(medicalRecords.createdAt, currentStart)
          )
        ),

      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.userId, userId),
            gte(medicalRecords.createdAt, previousStart),
            lte(medicalRecords.createdAt, currentStart)
          )
        ),
    ]);

    // Get medication counts (simplified)
    const currentMedications = await db
      .select({ count: count() })
      .from(medications)
      .where(
        and(eq(medications.userId, userId), eq(medications.isActive, true))
      );

    const current = {
      records: currentRecords[0].count,
      medications: currentMedications[0].count,
    };

    const previous = {
      records: previousRecords[0].count,
      medications: Math.max(
        0,
        current.medications - Math.floor(Math.random() * 3)
      ), // Placeholder
    };

    const changes = {
      records:
        previous.records > 0
          ? Math.round(
              ((current.records - previous.records) / previous.records) * 100
            )
          : current.records > 0
          ? 100
          : 0,
      medications:
        previous.medications > 0
          ? Math.round(
              ((current.medications - previous.medications) /
                previous.medications) *
                100
            )
          : current.medications > 0
          ? 100
          : 0,
    };

    return { current, previous, changes };
  }

  /**
   * Generate health insights based on data patterns
   */
  static generateHealthInsights(metrics: HealthMetrics): string[] {
    const insights: string[] = [];

    // Record upload patterns
    if (metrics.recentRecords === 0) {
      insights.push(
        "Consider uploading recent medical records to keep your health profile up to date."
      );
    } else if (metrics.recentRecords > 5) {
      insights.push(
        "Great job staying active with your health record management!"
      );
    }

    // Medication tracking
    if (metrics.activeMedications === 0) {
      insights.push(
        "Add your current medications to enable better health tracking and reminders."
      );
    } else if (metrics.activeMedications > 3) {
      insights.push(
        "You're tracking multiple medications - consider setting up reminders for better adherence."
      );
    }

    // Health score insights
    if (metrics.healthScore < 50) {
      insights.push(
        "Your health score could be improved by uploading more records and completing your profile."
      );
    } else if (metrics.healthScore > 80) {
      insights.push(
        "Excellent health score! You're doing great at managing your health data."
      );
    }

    // Trend insights
    if (metrics.trends.records > 20) {
      insights.push(
        "You've significantly increased your record uploads this month - keep it up!"
      );
    } else if (metrics.trends.records < -20) {
      insights.push(
        "Your record uploads have decreased. Regular updates help maintain better health tracking."
      );
    }

    return insights;
  }
}
