import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  medicalRecords,
  medications,
  notifications,
  medicalSummaries,
} from "@/lib/db/schema";
import { eq, and, gte, lte, count, desc, sql } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);

    // Get basic counts
    const [
      totalRecordsResult,
      totalMedicationsResult,
      totalNotificationsResult,
      unreadNotificationsResult,
      recentRecordsResult,
    ] = await Promise.all([
      // Total records
      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(eq(medicalRecords.userId, userId)),

      // Active medications
      db
        .select({ count: count() })
        .from(medications)
        .where(
          and(eq(medications.userId, userId), eq(medications.isActive, true))
        ),

      // Total notifications
      db
        .select({ count: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId)),

      // Unread notifications
      db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        ),

      // Recent records (last 30 days)
      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.userId, userId),
            gte(
              medicalRecords.createdAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
          )
        ),
    ]);

    // Get records by type
    const recordsByType = await db
      .select({
        type: medicalRecords.type,
        count: count(),
      })
      .from(medicalRecords)
      .where(eq(medicalRecords.userId, userId))
      .groupBy(medicalRecords.type);

    // Get records by month for the last 6 months
    const recordsByMonth = await db
      .select({
        month: sql<string>`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.userId, userId),
          gte(medicalRecords.createdAt, sixMonthsAgo)
        )
      )
      .groupBy(sql`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${medicalRecords.createdAt}, 'YYYY-MM')`);

    // Get health score calculation (simplified)
    const healthScoreFactors = {
      recordsUploaded: Math.min(totalRecordsResult[0].count * 2, 30), // Max 30 points
      medicationCompliance: Math.min(totalMedicationsResult[0].count * 5, 25), // Max 25 points
      recentActivity: Math.min(recentRecordsResult[0].count * 3, 20), // Max 20 points
      dataCompleteness: 25, // Base score for having an account
    };

    const healthScore = Math.min(
      Object.values(healthScoreFactors).reduce((sum, score) => sum + score, 0),
      100
    );

    // Calculate trends (comparing to previous period)
    const previousMonthStart = subMonths(startOfMonth(now), 1);
    const previousMonthEnd = endOfMonth(previousMonthStart);
    const currentMonthStart = startOfMonth(now);

    const [currentMonthRecords, previousMonthRecords] = await Promise.all([
      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.userId, userId),
            gte(medicalRecords.createdAt, currentMonthStart)
          )
        ),

      db
        .select({ count: count() })
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.userId, userId),
            gte(medicalRecords.createdAt, previousMonthStart),
            lte(medicalRecords.createdAt, previousMonthEnd)
          )
        ),
    ]);

    const recordsTrend =
      previousMonthRecords[0].count > 0
        ? ((currentMonthRecords[0].count - previousMonthRecords[0].count) /
            previousMonthRecords[0].count) *
          100
        : currentMonthRecords[0].count > 0
        ? 100
        : 0;

    // Format monthly data for charts
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthKey = format(month, "yyyy-MM");
      const monthData = recordsByMonth.find((r) => r.month === monthKey);

      monthlyData.push({
        month: format(month, "MMM yyyy"),
        records: monthData?.count || 0,
        medications: Math.floor(Math.random() * 5), // Placeholder - would need actual medication data by month
      });
    }

    const metrics = {
      totalRecords: totalRecordsResult[0].count,
      activeMedications: totalMedicationsResult[0].count,
      totalNotifications: totalNotificationsResult[0].count,
      unreadNotifications: unreadNotificationsResult[0].count,
      recentRecords: recentRecordsResult[0].count,
      healthScore,
      healthScoreFactors,
      trends: {
        records: Math.round(recordsTrend),
        medications: 5, // Placeholder
        healthScore: 2, // Placeholder
        notifications: -10, // Placeholder
      },
      recordsByType: recordsByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>),
      monthlyData,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
