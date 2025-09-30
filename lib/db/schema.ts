import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  jsonb,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const recordTypeEnum = pgEnum("record_type", [
  "prescription",
  "lab_result",
  "scan",
  "consultation",
  "other",
]);
export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const urgencyLevelEnum = pgEnum("urgency_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }>(),
  medicalHistory: jsonb("medical_history").$type<{
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    bloodType?: string;
  }>(),
  preferences: jsonb("preferences")
    .$type<{
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
      privacy: {
        shareWithEmergencyContacts: boolean;
        allowDataExport: boolean;
      };
    }>()
    .default({
      notifications: { email: true, sms: false, push: true },
      privacy: { shareWithEmergencyContacts: false, allowDataExport: true },
    }),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical Records table
export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: recordTypeEnum("type").notNull(),
  hospitalName: varchar("hospital_name", { length: 255 }).notNull(),
  doctorName: varchar("doctor_name", { length: 255 }),
  visitDate: date("visit_date").notNull(),
  notes: text("notes"),
  fileUrl: varchar("file_url", { length: 500 }),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  textContent: text("text_content"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isEmergencyRelevant: boolean("is_emergency_relevant").default(false),
  processingStatus:
    processingStatusEnum("processing_status").default("pending"),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical Summaries table (AI-generated summaries)
export const medicalSummaries = pgTable("medical_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  recordId: uuid("record_id")
    .references(() => medicalRecords.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  summary: text("summary").notNull(),
  extractedData: jsonb("extracted_data").$type<{
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions?: string;
      sideEffects?: string[];
      interactions?: string[];
    }>;
    labResults: Array<{
      testName: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      isAbnormal: boolean;
    }>;
    diagnoses: string[];
    recommendations: string[];
  }>(),
  riskFactors: jsonb("risk_factors")
    .$type<
      Array<{
        factor: string;
        severity: "low" | "medium" | "high";
        description: string;
      }>
    >()
    .default([]),
  urgencyLevel: urgencyLevelEnum("urgency_level").default("low"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  aiModel: varchar("ai_model", { length: 100 }),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medications table (for tracking current medications)
export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  recordId: uuid("record_id").references(() => medicalRecords.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }),
  instructions: text("instructions"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  reminderTimes: jsonb("reminder_times").$type<string[]>().default([]),
  sideEffects: jsonb("side_effects").$type<string[]>().default([]),
  interactions: jsonb("interactions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'medication', 'appointment', 'critical', 'reminder'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  channels: jsonb("channels")
    .$type<{
      email: boolean;
      sms: boolean;
      push: boolean;
    }>()
    .default({ email: false, sms: false, push: true }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification Preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  email: boolean("email").default(true),
  sms: boolean("sms").default(false),
  push: boolean("push").default(true),
  medicationReminders: boolean("medication_reminders").default(true),
  appointmentReminders: boolean("appointment_reminders").default(true),
  criticalAlerts: boolean("critical_alerts").default(true),
  healthCheckups: boolean("health_checkups").default(true),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("08:00"),
  timezone: varchar("timezone", { length: 50 }).default("Africa/Lagos"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Push Subscriptions table
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification Templates table
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  emailTemplate: text("email_template"),
  smsTemplate: text("sms_template"),
  pushTemplate: jsonb("push_template").$type<{
    title: string;
    body: string;
    icon?: string;
    badge?: string;
  }>(),
  channels: jsonb("channels")
    .$type<("email" | "sms" | "push")[]>()
    .default(["push"]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical Record Folders table
export const medicalRecordFolders = pgTable("medical_record_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("blue"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical Record Folder Items table (many-to-many relationship)
export const medicalRecordFolderItems = pgTable("medical_record_folder_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  folderId: uuid("folder_id")
    .references(() => medicalRecordFolders.id, { onDelete: "cascade" })
    .notNull(),
  recordId: uuid("record_id")
    .references(() => medicalRecords.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  doctorName: varchar("doctor_name", { length: 255 }),
  hospitalName: varchar("hospital_name", { length: 255 }),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30), // in minutes
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled, missed
  type: varchar("type", { length: 50 }).default("consultation"), // consultation, follow_up, checkup, procedure
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Health Events table
export const healthEvents = pgTable("health_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // symptom, milestone, measurement, activity
  severity: varchar("severity", { length: 20 }).default("low"), // low, medium, high, critical
  eventDate: timestamp("event_date").notNull(),
  value: varchar("value", { length: 100 }), // for measurements like weight, blood pressure
  unit: varchar("unit", { length: 20 }), // kg, mmHg, etc.
  tags: jsonb("tags").$type<string[]>().default([]),
  relatedRecordId: uuid("related_record_id").references(
    () => medicalRecords.id,
    {
      onDelete: "set null",
    }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Health Goals table
export const healthGoals = pgTable("health_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // weight, exercise, medication, checkup
  targetValue: varchar("target_value", { length: 100 }),
  currentValue: varchar("current_value", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  targetDate: date("target_date"),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, paused, cancelled
  progress: integer("progress").default(0), // percentage 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: uuid("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  medicalRecords: many(medicalRecords),
  medicalSummaries: many(medicalSummaries),
  medications: many(medications),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
  pushSubscriptions: many(pushSubscriptions),
  medicalRecordFolders: many(medicalRecordFolders),
  appointments: many(appointments),
  healthEvents: many(healthEvents),
  healthGoals: many(healthGoals),
  auditLogs: many(auditLogs),
}));

export const medicalRecordsRelations = relations(
  medicalRecords,
  ({ one, many }) => ({
    user: one(users, {
      fields: [medicalRecords.userId],
      references: [users.id],
    }),
    medicalSummaries: many(medicalSummaries),
    medications: many(medications),
    folderItems: many(medicalRecordFolderItems),
  })
);

export const medicalSummariesRelations = relations(
  medicalSummaries,
  ({ one }) => ({
    user: one(users, {
      fields: [medicalSummaries.userId],
      references: [users.id],
    }),
    record: one(medicalRecords, {
      fields: [medicalSummaries.recordId],
      references: [medicalRecords.id],
    }),
  })
);

export const medicationsRelations = relations(medications, ({ one }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  record: one(medicalRecords, {
    fields: [medications.recordId],
    references: [medicalRecords.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const medicalRecordFoldersRelations = relations(
  medicalRecordFolders,
  ({ one, many }) => ({
    user: one(users, {
      fields: [medicalRecordFolders.userId],
      references: [users.id],
    }),
    folderItems: many(medicalRecordFolderItems),
  })
);

export const medicalRecordFolderItemsRelations = relations(
  medicalRecordFolderItems,
  ({ one }) => ({
    folder: one(medicalRecordFolders, {
      fields: [medicalRecordFolderItems.folderId],
      references: [medicalRecordFolders.id],
    }),
    record: one(medicalRecords, {
      fields: [medicalRecordFolderItems.recordId],
      references: [medicalRecords.id],
    }),
  })
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const healthEventsRelations = relations(healthEvents, ({ one }) => ({
  user: one(users, {
    fields: [healthEvents.userId],
    references: [users.id],
  }),
  relatedRecord: one(medicalRecords, {
    fields: [healthEvents.relatedRecordId],
    references: [medicalRecords.id],
  }),
}));

export const healthGoalsRelations = relations(healthGoals, ({ one }) => ({
  user: one(users, {
    fields: [healthGoals.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  })
);

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
);
