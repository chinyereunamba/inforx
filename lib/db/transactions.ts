import { getDb } from "./connection";
import { auditLogQueries } from "./queries";

const db = getDb();

/**
 * Execute a function within a database transaction
 */
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>,
  options?: {
    isolationLevel?:
      | "read uncommitted"
      | "read committed"
      | "repeatable read"
      | "serializable";
    accessMode?: "read write" | "read only";
  }
): Promise<T> {
  return await db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  });
}

/**
 * Execute multiple operations in a single transaction with audit logging
 */
export async function withAuditedTransaction<T>(
  callback: (tx: typeof db) => Promise<T>,
  auditData: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<T> {
  return await withTransaction(async (tx) => {
    const result = await callback(tx);

    // Create audit log entry
    await auditLogQueries.create({
      ...auditData,
      createdAt: new Date(),
    });

    return result;
  });
}

/**
 * Retry a database operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `Database operation failed (attempt ${attempt + 1}/${
          maxRetries + 1
        }), retrying in ${delay}ms:`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const retryableCodes = [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "40001", // PostgreSQL serialization failure
    "40P01", // PostgreSQL deadlock detected
    "53300", // PostgreSQL too many connections
  ];

  return retryableCodes.some(
    (code) =>
      error.code === code ||
      error.message?.includes(code) ||
      error.sqlState === code
  );
}

/**
 * Batch insert with transaction support
 */
export async function batchInsert<T extends Record<string, any>>(
  table: any,
  data: T[],
  batchSize = 100
): Promise<T[]> {
  if (data.length === 0) return [];

  const results: T[] = [];

  return await withTransaction(async (tx) => {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = await tx.insert(table).values(batch).returning();
      results.push(...batchResults);
    }

    return results;
  });
}

/**
 * Batch update with transaction support
 */
export async function batchUpdate<T extends Record<string, any>>(
  operations: Array<{
    table: any;
    data: Partial<T>;
    where: any;
  }>
): Promise<void> {
  return await withTransaction(async (tx) => {
    for (const operation of operations) {
      await tx
        .update(operation.table)
        .set(operation.data)
        .where(operation.where);
    }
  });
}

/**
 * Safe delete with cascade handling
 */
export async function safeDelete(
  table: any,
  where: any,
  options?: {
    checkReferences?: boolean;
    auditData?: {
      userId?: string;
      action: string;
      resourceType: string;
      ipAddress?: string;
      userAgent?: string;
    };
  }
): Promise<any[]> {
  return await withTransaction(async (tx) => {
    // First, get the records to be deleted for audit purposes
    const recordsToDelete = await tx.select().from(table).where(where);

    if (recordsToDelete.length === 0) {
      return [];
    }

    // Create audit log if audit data is provided
    if (options?.auditData) {
      for (const record of recordsToDelete) {
        await auditLogQueries.create({
          ...options.auditData,
          resourceId: record.id,
          oldValues: record,
          createdAt: new Date(),
        });
      }
    }

    // Perform the delete
    const deletedRecords = await tx.delete(table).where(where).returning();

    return deletedRecords;
  });
}
