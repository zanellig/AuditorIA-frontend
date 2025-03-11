import { env } from "@/env"
import { cookies } from "next/headers"

// Constants for notification keys
export const GLOBAL_NOTIFICATIONS_KEY = "notifications:global"
export const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days

// Admin API key should be stored in environment variables
// For development, we'll use a hardcoded value, but in production
// this should be a secure, randomly generated string
const ADMIN_API_KEY = env.ADMIN_API_KEY

/**
 * Gets the Redis key for user-specific notifications based on the session cookie
 * @returns The Redis key for the current user's notifications
 */
export async function getUserNotificationsKey(): Promise<string> {
  // Use a cookie or session ID to identify the user
  const cookieStore = cookies()
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
 * In a real application, this would check session data or auth headers
 */
export async function isAdmin(): Promise<boolean> {
  // In a real application, you would check:
  // 1. If the user is authenticated
  // 2. If the user has admin role/permissions
  // 3. Possibly verify against a database or auth service

  // For development purposes, we're using a simplified check
  // This should be replaced with proper authentication in production

  // For now, we'll assume admin status based on environment
  // In development, this will return true for testing purposes
  if (process.env.NODE_ENV === "development") {
    return true
  }

  // In production, you would implement proper admin checks
  // For example, checking JWT tokens, session data, or headers

  // Example implementation checking for admin API key in headers:
  // const { headers } = require('next/headers')
  // const authHeader = headers().get('Authorization')
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return false
  // }
  // const apiKey = authHeader.substring(7) // Remove "Bearer " prefix
  // return apiKey === ADMIN_API_KEY

  return false // Default to false in production unless proper auth is implemented
}
