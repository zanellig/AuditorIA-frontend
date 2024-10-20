import "server-only"
import * as Sentry from "@sentry/nextjs"
import { env } from "@/env"

export async function register() {
  console.log("Running in environment:", env.NODE_ENV)
  if (env.NODE_ENV === "production") {
    if (env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config")
    }

    if (env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config")
    }
  }
}

export const onRequestError =
  env.NODE_ENV === "production" ? Sentry.captureRequestError : undefined
