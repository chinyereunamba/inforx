import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Global connection pool
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "inforx_db",
  user: process.env.DB_USER || "username",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // Maximum number of connections in the pool
  min: 2, // Minimum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

/**
 * Get or create database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    // Handle pool connection events
    pool.on("connect", (client) => {
      console.log("New client connected to database");
    });

    pool.on("remove", (client) => {
      console.log("Client removed from pool");
    });
  }

  return pool;
}

/**
 * Get or create Drizzle database instance
 */
export function getDb() {
  if (!db) {
    const connectionPool = getPool();
    db = drizzle(connectionPool, { schema });
  }

  return db;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const database = getDb();
    await database.execute("SELECT 1");
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
    console.log("Database connection pool closed");
  }
}

/**
 * Get connection pool statistics
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }

  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Export the database instance as default
export default getDb;
