import { getDb, getPoolStats, testConnection } from "./connection";
import { sql } from "drizzle-orm";

const db = getDb();

export interface DatabaseHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  connectionPool: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } | null;
  performance: {
    queryTime: number;
    connectionTime: number;
  };
  version: string | null;
  uptime: number | null;
  errors: string[];
}

/**
 * Comprehensive database health check
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const health: DatabaseHealth = {
    status: "healthy",
    timestamp: new Date(),
    connectionPool: getPoolStats(),
    performance: {
      queryTime: 0,
      connectionTime: 0,
    },
    version: null,
    uptime: null,
    errors: [],
  };

  try {
    // Test basic connectivity
    const connectionStart = Date.now();
    const isConnected = await testConnection();
    health.performance.connectionTime = Date.now() - connectionStart;

    if (!isConnected) {
      health.status = "unhealthy";
      health.errors.push("Database connection failed");
      return health;
    }

    // Test query performance
    const queryStart = Date.now();
    try {
      const versionResult = await db.execute(sql`SELECT version()`);
      health.version = versionResult.rows[0]?.version || null;
      health.performance.queryTime = Date.now() - queryStart;
    } catch (error) {
      health.errors.push(`Query test failed: ${error}`);
      health.status = "degraded";
    }

    // Get database uptime
    try {
      const uptimeResult = await db.execute(sql`
        SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime
      `);
      health.uptime = uptimeResult.rows[0]?.uptime || null;
    } catch (error) {
      health.errors.push(`Uptime check failed: ${error}`);
    }

    // Check connection pool health
    const poolStats = health.connectionPool;
    if (poolStats) {
      if (poolStats.waitingCount > 5) {
        health.status = "degraded";
        health.errors.push(
          `High connection wait count: ${poolStats.waitingCount}`
        );
      }

      if (poolStats.totalCount === 0) {
        health.status = "unhealthy";
        health.errors.push("No database connections available");
      }
    }

    // Check query performance
    if (health.performance.queryTime > 1000) {
      health.status = "degraded";
      health.errors.push(
        `Slow query performance: ${health.performance.queryTime}ms`
      );
    }
  } catch (error) {
    health.status = "unhealthy";
    health.errors.push(`Health check failed: ${error}`);
  }

  return health;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename
    `);

    return stats.rows;
  } catch (error) {
    console.error("Failed to get database stats:", error);
    return [];
  }
}

/**
 * Get active connections information
 */
export async function getActiveConnections() {
  try {
    const connections = await db.execute(sql`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        client_port,
        backend_start,
        state,
        query_start,
        LEFT(query, 100) as query_preview
      FROM pg_stat_activity 
      WHERE state = 'active' 
        AND pid <> pg_backend_pid()
      ORDER BY query_start DESC
    `);

    return connections.rows;
  } catch (error) {
    console.error("Failed to get active connections:", error);
    return [];
  }
}

/**
 * Get database size information
 */
export async function getDatabaseSize() {
  try {
    const sizeInfo = await db.execute(sql`
      SELECT 
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size,
        pg_database_size(pg_database.datname) as size_bytes
      FROM pg_database
      WHERE pg_database.datname = current_database()
    `);

    const tablesSizeInfo = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return {
      database: sizeInfo.rows[0] || null,
      tables: tablesSizeInfo.rows,
    };
  } catch (error) {
    console.error("Failed to get database size:", error);
    return { database: null, tables: [] };
  }
}

/**
 * Monitor slow queries
 */
export async function getSlowQueries(minDuration = 1000) {
  try {
    const slowQueries = await db.execute(sql`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        max_time,
        min_time,
        stddev_time
      FROM pg_stat_statements 
      WHERE mean_time > ${minDuration}
      ORDER BY mean_time DESC 
      LIMIT 10
    `);

    return slowQueries.rows;
  } catch (error) {
    // pg_stat_statements extension might not be installed
    console.warn("pg_stat_statements not available for slow query monitoring");
    return [];
  }
}

/**
 * Check for database locks
 */
export async function getDatabaseLocks() {
  try {
    const locks = await db.execute(sql`
      SELECT 
        l.pid,
        l.mode,
        l.locktype,
        l.relation::regclass as relation,
        l.granted,
        a.usename,
        a.query_start,
        a.state,
        LEFT(a.query, 100) as query_preview
      FROM pg_locks l
      JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE NOT l.granted
      ORDER BY l.pid
    `);

    return locks.rows;
  } catch (error) {
    console.error("Failed to get database locks:", error);
    return [];
  }
}

/**
 * Performance monitoring utility
 */
export class DatabaseMonitor {
  private healthHistory: DatabaseHealth[] = [];
  private maxHistorySize = 100;

  /**
   * Record health check result
   */
  recordHealth(health: DatabaseHealth) {
    this.healthHistory.push(health);

    // Keep only recent history
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get health trends
   */
  getHealthTrends() {
    if (this.healthHistory.length === 0) return null;

    const recent = this.healthHistory.slice(-10);
    const avgQueryTime =
      recent.reduce((sum, h) => sum + h.performance.queryTime, 0) /
      recent.length;
    const avgConnectionTime =
      recent.reduce((sum, h) => sum + h.performance.connectionTime, 0) /
      recent.length;

    const statusCounts = recent.reduce((counts, h) => {
      counts[h.status] = (counts[h.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      averageQueryTime: avgQueryTime,
      averageConnectionTime: avgConnectionTime,
      statusDistribution: statusCounts,
      totalChecks: recent.length,
      lastCheck: recent[recent.length - 1]?.timestamp,
    };
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): DatabaseHealth | null {
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  /**
   * Check if database is healthy
   */
  isHealthy(): boolean {
    const current = this.getCurrentHealth();
    return current?.status === "healthy";
  }
}

// Export singleton monitor instance
export const databaseMonitor = new DatabaseMonitor();
