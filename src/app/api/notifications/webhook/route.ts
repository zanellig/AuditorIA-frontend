import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"

/**
 * Notifications Webhook API
 *
 * This endpoint allows external systems to send notifications to users.
 * Notifications are stored in Redis and published to a Redis channel for real-time updates.
 *
 * Request format:
 * {
 *   "uuid": "optional-uuid-will-be-generated-if-not-provided",
 *   "text": "Your notification message here",
 *   "task": {
 *     "identifier": "task-identifier",
 *     "file_name": "optional-file-name.mp3"
 *   },
 *   "userId": "optional-user-id-for-targeting-specific-user"
 * }
 *
 * [!IMPORTANT]:
 * If no userId is provided, the notification will be treated as global
 * and sent to all connected clients.
 *
 * For detailed documentation, see docs/notifications-webhook.md
 */

const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days
const GLOBAL_NOTIFICATIONS_KEY = "notifications:global"

// Get user-specific Redis key for notifications
async function getUserNotificationsKey(userId = "anonymous") {
  return `notifications:${userId}`
}

// POST a new notification via webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract user ID from the request if provided
    // If no userId is provided, this is a global notification
    const isGlobalNotification = !body.userId
    const userId = body.userId || "global"

    console.log(
      `Webhook notification received. Global: ${isGlobalNotification}, UserId: ${userId}`
    )

    const notification = {
      uuid: body.uuid || randomUUID(),
      timestamp: body.timestamp || Date.now(),
      read: false,
      text: body.text,
      task: body.task,
      isGlobal: isGlobalNotification, // Add a flag to identify global notifications
    }

    // Validate notification
    const validatedNotification = notificationSchema.parse(notification)

    // Get the user-specific key or global key
    const key = await getUserNotificationsKey(userId)

    // Start processing the notification asynchronously
    // This allows us to return a response quickly without waiting for Redis operations
    const processNotificationPromise = (async () => {
      try {
        // Check if this notification already exists (by uuid)
        const existingNotifications = await redisClient.lrange(key, 0, -1)
        const exists = existingNotifications.some(item => {
          try {
            const parsedItem = JSON.parse(item)
            return parsedItem.uuid === validatedNotification.uuid
          } catch {
            return false
          }
        })

        if (exists) {
          console.log(
            `Notification with UUID ${validatedNotification.uuid} already exists, not adding duplicate`
          )
          return
        }

        // Add notification to the beginning of the list
        await redisClient.lpush(key, JSON.stringify(validatedNotification))

        // Set expiration on the key if it doesn't exist
        await redisClient.expire(key, NOTIFICATIONS_TTL)

        // Publish the notification to the appropriate channel for real-time updates
        if (isGlobalNotification) {
          // For global notifications, publish to the global channel
          await redisClient.publish(
            "notification:global",
            JSON.stringify(validatedNotification)
          )
          console.log(
            `Global notification ${validatedNotification.uuid} published`
          )
        } else {
          // For user-specific notifications, publish to the user's channel
          await redisClient.publish(
            `notification:${key}`,
            JSON.stringify(validatedNotification)
          )
          console.log(
            `User notification ${validatedNotification.uuid} published to ${key}`
          )
        }

        console.log(
          `Notification ${validatedNotification.uuid} processed successfully`
        )
      } catch (error) {
        console.error("Error in async notification processing:", error)
      }
    })()

    // Don't await the promise, let it run in the background
    // This prevents blocking the response

    // Return a success response immediately
    return NextResponse.json(
      {
        ...validatedNotification,
        isGlobal: isGlobalNotification,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating notification via webhook:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}
