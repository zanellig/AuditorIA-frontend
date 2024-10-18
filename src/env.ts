import "server-only"
import { z } from "zod"

// Define the schema for the environment variables
const envSchema = z.object({
  API_MAIN: z.string(),
  API_CANARY: z.string(),
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]),
  APP_ENV: z.enum(["local", "remote"]),
  NODE_ENV: z.enum(["development", "production"]),
  NEXT_CPU_PROF: z.string().optional(),
  NEXT_TURBOPACK_TRACING: z.string().optional(),
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("80"), // Defaults to HTTP port
  HOST: z.string(),
  JWT_SECRET: z.string().min(32).optional(), // Example for a secret key. Optional until we implement auth
  LDAP_USERNAME: z.string(),
  LDAP_PASSWORD: z.string(),
  LDAP_DOMAIN: z.string(),
  SENTRY_AUTH_TOKEN: z.string(),
})

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format())
  throw new Error("Invalid environment variables.")
}

export const env = parsedEnv.data
