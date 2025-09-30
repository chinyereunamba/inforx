// Database connection and configuration
export {
  getDb,
  testConnection,
  closeConnection,
  getPoolStats,
} from "./connection";

// Database schema
export * from "./schema";

// Query utilities
export {
  userQueries,
  medicalRecordQueries,
  medicalSummaryQueries,
  medicationQueries,
  notificationQueries,
  auditLogQueries,
} from "./queries";

// Transaction utilities
export {
  withTransaction,
  withAuditedTransaction,
  withRetry,
  batchInsert,
  batchUpdate,
  safeDelete,
} from "./transactions";

// Health monitoring
export {
  checkDatabaseHealth,
  getDatabaseStats,
  getActiveConnections,
  getDatabaseSize,
  getSlowQueries,
  getDatabaseLocks,
  DatabaseMonitor,
  databaseMonitor,
} from "./health";

// Types
export type { DatabaseHealth } from "./health";

// Default export
export { default as db } from "./connection";
