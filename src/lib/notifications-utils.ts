import "server-only"
import { cookies } from "next/headers"

// Constants for notification keys
export const GLOBAL_NOTIFICATIONS_KEY = "notifications:global"
export const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days

/**
 * Gets the Redis key for user-specific notifications based on the session cookie
 * @returns The Redis key for the current user's notifications
 *
 * ### Only use in route handlers or server actions
 */
export async function getUserNotificationsKey(): Promise<string> {
  // Use a cookie or session ID to identify the user
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  // Create a unique key based on the session or a default for anonymous users
  const userId = sessionCookie?.value
    ? sessionCookie.value.split(" ")[1].substring(0, 10)
    : "anonymous"

  return `notifications:${userId}`
}

/**
 * Gets the Redis key for user-specific notifications based on a provided userId
 * @param userId The user ID to get the notifications key for
 * @returns The Redis key for the specified user's notifications
 */
export function getNotificationsKeyForUser(
  userId: string = "anonymous"
): string {
  return `notifications:${userId}`
}

/**
 * Gets the Redis pub/sub channel name for user-specific notifications
 * @param notificationsKey The notifications key to get the channel for
 * @returns The Redis pub/sub channel name
 */
export function getNotificationsChannel(notificationsKey: string): string {
  return `notification:${notificationsKey}`
}

/**
 * Gets the Redis pub/sub channel name for global notifications
 * @returns The Redis pub/sub channel name for global notifications
 */
export function getGlobalNotificationsChannel(): string {
  return "notification:global"
}

/**
 * Checks if the current request is from an admin user
 */
export async function isAdmin(): Promise<boolean> {
  // For development purposes, we're using a simplified check
  // This should be replaced with proper authentication in production

  // For now, we'll assume admin status based on environment
  // In development, this will return true for testing purposes
  if (process.env.NODE_ENV === "development") {
    return true
  }

  return false // Default to false in production unless proper auth is implemented
}
