import "server-only"
import Redis from "ioredis"
import { env } from "@/env"

// Use a global variable to maintain a singleton instance across hot reloads and serverless invocations
declare global {
  // This declaration allows us to add a custom property to the Node.js global object.
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined
}

// Reuse existing client if available, otherwise create a new one
const redisClient =
  global.redisClient ||
  new Redis("redis://10.20.62.96:6379", {
    keyPrefix: "auditoria:",
    retryStrategy: times => {
      // Retry 5 times before giving up.
      return times < 5 ? 1000 : undefined
    },
  })

if (env.NODE_ENV !== "production") {
  // In development, assign the client to the global object to avoid creating multiple instances during hot reloads.
  global.redisClient = redisClient
}

redisClient.on("error", err => {
  console.error("Redis Client Error", err)
})

export default redisClient
