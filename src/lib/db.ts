import "server-only"
import mysql from "mysql2/promise"
import { env } from "@/env"

// Update env.ts later to include these variables
declare module "@/env" {
  interface ProcessEnv {
    MYSQL_HOST: string
    MYSQL_PORT: number
    MYSQL_USER: string
    MYSQL_PASSWORD: string
    MYSQL_DATABASE: string
  }
}

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "auditoria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Singleton to maintain connection across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined
}

// Use existing pool or create a new one
export const db = global.mysqlPool || pool

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = db
}

// Helper function to execute SQL queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await db.execute(sql, params)
    return results as T
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
