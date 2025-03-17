import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"
import {
  getNotificationsKeyForUser,
  GLOBAL_NOTIFICATIONS_KEY,
  NOTIFICATIONS_TTL,
  getNotificationsChannel,
  getGlobalNotificationsChannel,
} from "@/lib/notifications-utils"
import { getHeaders } from "@/lib/get-headers"

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
    const key = isGlobalNotification
      ? GLOBAL_NOTIFICATIONS_KEY
      : getNotificationsKeyForUser(userId)

    // Start processing the notification asynchronously
    // This allows us to return a response quickly without waiting for Redis operations
    const processNotificationPromise = (async () => {
      try {
        // Check if this notification already exists (by uuid)
        const existingNotifications = await redisClient.lrange(key, 0, -1)
        let existingNotificationJson = null

        for (const item of existingNotifications) {
          try {
            const parsedItem = JSON.parse(item)
            if (parsedItem.uuid === validatedNotification.uuid) {
              existingNotificationJson = item
              break
            }
          } catch {
            continue
          }
        }

        if (existingNotificationJson) {
          console.log(
            `Notification with UUID ${validatedNotification.uuid} already exists, updating it`
          )

          // Remove the existing notification
          await redisClient.lrem(key, 0, existingNotificationJson)

          // Add the updated notification to the beginning of the list
          await redisClient.lpush(key, JSON.stringify(validatedNotification))

          // Set expiration on the key if it doesn't exist
          await redisClient.expire(key, NOTIFICATIONS_TTL)

          console.log(
            `Notification ${validatedNotification.uuid} updated successfully`
          )

          // Publish the updated notification to the appropriate channel
          if (isGlobalNotification) {
            // For global notifications, publish to the global channel
            const globalChannel = getGlobalNotificationsChannel()
            await redisClient.publish(
              globalChannel,
              JSON.stringify(validatedNotification)
            )
            console.log(
              `Updated global notification ${validatedNotification.uuid} published`
            )
          } else {
            // For user-specific notifications, publish to the user's channel
            const userChannel = getNotificationsChannel(key)
            await redisClient.publish(
              userChannel,
              JSON.stringify(validatedNotification)
            )
            console.log(
              `Updated user notification ${validatedNotification.uuid} published to ${key}`
            )
          }

          return
        }

        // Add notification to the beginning of the list
        await redisClient.lpush(key, JSON.stringify(validatedNotification))

        // Set expiration on the key if it doesn't exist
        await redisClient.expire(key, NOTIFICATIONS_TTL)

        // Publish the notification to the appropriate channel for real-time updates
        if (isGlobalNotification) {
          // For global notifications, publish to the global channel
          const globalChannel = getGlobalNotificationsChannel()
          await redisClient.publish(
            globalChannel,
            JSON.stringify(validatedNotification)
          )
          console.log(
            `Global notification ${validatedNotification.uuid} published`
          )
        } else {
          // For user-specific notifications, publish to the user's channel
          const userChannel = getNotificationsChannel(key)
          await redisClient.publish(
            userChannel,
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
      { status: 201, headers: await getHeaders(request) }
    )
  } catch (error) {
    console.error("Error creating notification via webhook:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400, headers: await getHeaders(request) }
      )
    }
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}
