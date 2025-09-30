import {
  eq,
  and,
  or,
  desc,
  asc,
  count,
  sql,
  ilike,
  between,
} from "drizzle-orm";
import { getDb } from "./connection";
import * as schema from "./schema";
import type {
  users,
  medicalRecords,
  medicalSummaries,
  medications,
  notifications,
  auditLogs,
} from "./schema";

const db = getDb();

// User queries
export const userQueries = {
  /**
   * Find user by email
   */
  findByEmail: async (email: string) => {
    return await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
  },

  /**
   * Find user by ID
   */
  findById: async (id: string) => {
    return await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
  },

  /**
   * Create new user
   */
  create: async (userData: typeof users.$inferInsert) => {
    return await db.insert(schema.users).values(userData).returning();
  },

  /**
   * Update user
   */
  update: async (id: string, userData: Partial<typeof users.$inferInsert>) => {
    return await db
      .update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
  },

  /**
   * Delete user
   */
  delete: async (id: string) => {
    return await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();
  },

  /**
   * Update last login
   */
  updateLastLogin: async (id: string) => {
    return await db
      .update(schema.users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, id));
  },
};

// Medical Records queries
export const medicalRecordQueries = {
  /**
   * Find records by user ID
   */
  findByUserId: async (userId: string, limit = 50, offset = 0) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(eq(schema.medicalRecords.userId, userId))
      .orderBy(desc(schema.medicalRecords.visitDate))
      .limit(limit)
      .offset(offset);
  },

  /**
   * Find record by ID
   */
  findById: async (id: string) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(eq(schema.medicalRecords.id, id))
      .limit(1);
  },

  /**
   * Search records by text content
   */
  searchByContent: async (userId: string, searchTerm: string, limit = 20) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(
        and(
          eq(schema.medicalRecords.userId, userId),
          or(
            ilike(schema.medicalRecords.title, `%${searchTerm}%`),
            ilike(schema.medicalRecords.textContent, `%${searchTerm}%`),
            ilike(schema.medicalRecords.hospitalName, `%${searchTerm}%`),
            ilike(schema.medicalRecords.doctorName, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(schema.medicalRecords.visitDate))
      .limit(limit);
  },

  /**
   * Filter records by date range
   */
  findByDateRange: async (userId: string, startDate: Date, endDate: Date) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(
        and(
          eq(schema.medicalRecords.userId, userId),
          between(
            schema.medicalRecords.visitDate,
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0]
          )
        )
      )
      .orderBy(desc(schema.medicalRecords.visitDate));
  },

  /**
   * Filter records by type
   */
  findByType: async (userId: string, type: string) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(
        and(
          eq(schema.medicalRecords.userId, userId),
          eq(schema.medicalRecords.type, type as any)
        )
      )
      .orderBy(desc(schema.medicalRecords.visitDate));
  },

  /**
   * Create new medical record
   */
  create: async (recordData: typeof medicalRecords.$inferInsert) => {
    return await db
      .insert(schema.medicalRecords)
      .values(recordData)
      .returning();
  },

  /**
   * Update medical record
   */
  update: async (
    id: string,
    recordData: Partial<typeof medicalRecords.$inferInsert>
  ) => {
    return await db
      .update(schema.medicalRecords)
      .set({ ...recordData, updatedAt: new Date() })
      .where(eq(schema.medicalRecords.id, id))
      .returning();
  },

  /**
   * Delete medical record
   */
  delete: async (id: string) => {
    return await db
      .delete(schema.medicalRecords)
      .where(eq(schema.medicalRecords.id, id))
      .returning();
  },

  /**
   * Get records count by user
   */
  getCountByUser: async (userId: string) => {
    const result = await db
      .select({ count: count() })
      .from(schema.medicalRecords)
      .where(eq(schema.medicalRecords.userId, userId));
    return result[0]?.count || 0;
  },

  /**
   * Get emergency relevant records
   */
  getEmergencyRecords: async (userId: string) => {
    return await db
      .select()
      .from(schema.medicalRecords)
      .where(
        and(
          eq(schema.medicalRecords.userId, userId),
          eq(schema.medicalRecords.isEmergencyRelevant, true)
        )
      )
      .orderBy(desc(schema.medicalRecords.visitDate));
  },
};

// Medical Summary queries
export const medicalSummaryQueries = {
  /**
   * Find summary by record ID
   */
  findByRecordId: async (recordId: string) => {
    return await db
      .select()
      .from(schema.medicalSummaries)
      .where(eq(schema.medicalSummaries.recordId, recordId))
      .limit(1);
  },

  /**
   * Find summaries by user ID
   */
  findByUserId: async (userId: string, limit = 20) => {
    return await db
      .select()
      .from(schema.medicalSummaries)
      .where(eq(schema.medicalSummaries.userId, userId))
      .orderBy(desc(schema.medicalSummaries.processedAt))
      .limit(limit);
  },

  /**
   * Create new summary
   */
  create: async (summaryData: typeof medicalSummaries.$inferInsert) => {
    return await db
      .insert(schema.medicalSummaries)
      .values(summaryData)
      .returning();
  },

  /**
   * Update summary
   */
  update: async (
    id: string,
    summaryData: Partial<typeof medicalSummaries.$inferInsert>
  ) => {
    return await db
      .update(schema.medicalSummaries)
      .set({ ...summaryData, updatedAt: new Date() })
      .where(eq(schema.medicalSummaries.id, id))
      .returning();
  },

  /**
   * Get critical summaries
   */
  getCriticalSummaries: async (userId: string) => {
    return await db
      .select()
      .from(schema.medicalSummaries)
      .where(
        and(
          eq(schema.medicalSummaries.userId, userId),
          eq(schema.medicalSummaries.urgencyLevel, "critical")
        )
      )
      .orderBy(desc(schema.medicalSummaries.processedAt));
  },
};

// Medication queries
export const medicationQueries = {
  /**
   * Find active medications by user
   */
  findActiveByUserId: async (userId: string) => {
    return await db
      .select()
      .from(schema.medications)
      .where(
        and(
          eq(schema.medications.userId, userId),
          eq(schema.medications.isActive, true)
        )
      )
      .orderBy(asc(schema.medications.name));
  },

  /**
   * Find all medications by user
   */
  findByUserId: async (userId: string) => {
    return await db
      .select()
      .from(schema.medications)
      .where(eq(schema.medications.userId, userId))
      .orderBy(desc(schema.medications.createdAt));
  },

  /**
   * Create new medication
   */
  create: async (medicationData: typeof medications.$inferInsert) => {
    return await db
      .insert(schema.medications)
      .values(medicationData)
      .returning();
  },

  /**
   * Update medication
   */
  update: async (
    id: string,
    medicationData: Partial<typeof medications.$inferInsert>
  ) => {
    return await db
      .update(schema.medications)
      .set({ ...medicationData, updatedAt: new Date() })
      .where(eq(schema.medications.id, id))
      .returning();
  },

  /**
   * Deactivate medication
   */
  deactivate: async (id: string) => {
    return await db
      .update(schema.medications)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.medications.id, id))
      .returning();
  },
};

// Notification queries
export const notificationQueries = {
  /**
   * Find unread notifications by user
   */
  findUnreadByUserId: async (userId: string) => {
    return await db
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false)
        )
      )
      .orderBy(desc(schema.notifications.createdAt));
  },

  /**
   * Find all notifications by user
   */
  findByUserId: async (userId: string, limit = 50) => {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit);
  },

  /**
   * Create new notification
   */
  create: async (notificationData: typeof notifications.$inferInsert) => {
    return await db
      .insert(schema.notifications)
      .values(notificationData)
      .returning();
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    return await db
      .update(schema.notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(schema.notifications.id, id))
      .returning();
  },

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead: async (userId: string) => {
    return await db
      .update(schema.notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, false)
        )
      );
  },
};

// Audit log queries
export const auditLogQueries = {
  /**
   * Create audit log entry
   */
  create: async (logData: typeof auditLogs.$inferInsert) => {
    return await db.insert(schema.auditLogs).values(logData).returning();
  },

  /**
   * Find audit logs by user
   */
  findByUserId: async (userId: string, limit = 100) => {
    return await db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.userId, userId))
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit);
  },

  /**
   * Find audit logs by resource
   */
  findByResource: async (resourceType: string, resourceId: string) => {
    return await db
      .select()
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.resourceType, resourceType),
          eq(schema.auditLogs.resourceId, resourceId)
        )
      )
      .orderBy(desc(schema.auditLogs.createdAt));
  },
};
