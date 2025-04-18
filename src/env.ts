import "server-only"
import { z } from "zod"

// Define the schema for the environment variables
const envSchema = z.object({
  LDAP_USERNAME: z.string(),
  LDAP_PASSWORD: z.string(),
  LDAP_DOMAIN: z.string(),

  API_MAIN: z.string(),
  API_CANARY_7000: z.string(),
  API_CANARY_8000: z.string(),
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]),
  APP_ENV: z.enum(["local", "remote"]),
  NODE_ENV: z.enum(["development", "production"]),
  NEXT_CPU_PROF: z.string().optional(),
  NEXT_TURBOPACK_TRACING: z.string().optional(),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("80"), // Defaults to HTTP port
  HOST: z.string(),

  MAIL_HOST: z.string(),
  MAIL_PORT: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string(),
  MAIL_TO: z
    .string()
    .transform(val => val.split(",").map(email => email.trim())),

  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string(),

  ADMIN_SECRET: z.string(),

  // MySQL connection details
  MYSQL_HOST: z.string(),
  MYSQL_PORT: z.string().regex(/^\d+$/).transform(Number).default("3306"),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string().default("auditoria_db"),
})

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format())
  throw new Error("Invalid environment variables.")
}

export const env = parsedEnv.data
