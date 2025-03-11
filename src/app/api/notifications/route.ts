import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"
import { cookies } from "next/headers"

const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days
const GLOBAL_NOTIFICATIONS_KEY = "notifications:global"

// Get user-specific Redis key for notifications
async function getUserNotificationsKey() {
  // Use a cookie or session ID to identify the user
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")
  // Create a unique key based on the session or a default for anonymous users
  const userId = sessionCookie?.value
    ? sessionCookie.value.split(" ")[1].substring(0, 10)
    : "anonymous"
  return `notifications:${userId}`
}

// GET all notifications for the current user, including global notifications
export async function GET() {
  try {
    const userKey = await getUserNotificationsKey()

    // Fetch both user-specific and global notifications
    const [userNotificationsData, globalNotificationsData] = await Promise.all([
      redisClient.lrange(userKey, 0, -1),
      redisClient.lrange(GLOBAL_NOTIFICATIONS_KEY, 0, -1),
    ])

    // Parse user notifications
    const userNotifications = userNotificationsData
      .map(item => {
        try {
          return JSON.parse(item)
        } catch (e) {
          console.error("Error parsing user notification:", e)
          return null
        }
      })
      .filter(Boolean)

    // Parse global notifications
    const globalNotifications = globalNotificationsData
      .map(item => {
        try {
          return JSON.parse(item)
        } catch (e) {
          console.error("Error parsing global notification:", e)
          return null
        }
      })
      .filter(Boolean)

    // Combine and sort notifications by timestamp (newest first)
    const allNotifications = [
      ...userNotifications,
      ...globalNotifications,
    ].sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json(
      { notifications: allNotifications },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const notification = {
      uuid: body.uuid || randomUUID(),
      timestamp: body.timestamp || Date.now(),
      read: false,
      text: body.text,
      task: body.task,
    }

    // Validate notification
    const validatedNotification = notificationSchema.parse(notification)

    const key = await getUserNotificationsKey()

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

        // Publish the notification to the user's channel for real-time updates
        await redisClient.publish(
          `notification:${key}`,
          JSON.stringify(validatedNotification)
        )

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
    return NextResponse.json(validatedNotification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
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

// DELETE a notification or all notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uuid = searchParams.get("uuid")
    const userKey = await getUserNotificationsKey()

    console.log(
      `DELETE request received. UUID: ${uuid || "all"}, User key: ${userKey}`
    )

    if (uuid) {
      // Delete specific notification
      const [userNotificationsData, globalNotificationsData] =
        await Promise.all([
          redisClient.lrange(userKey, 0, -1),
          redisClient.lrange(GLOBAL_NOTIFICATIONS_KEY, 0, -1),
        ])

      console.log(
        `Found ${userNotificationsData.length} user notifications and ${globalNotificationsData.length} global notifications`
      )

      // Check user notifications
      let userNotificationDeleted = false
      for (let i = 0; i < userNotificationsData.length; i++) {
        try {
          const notification = JSON.parse(userNotificationsData[i])
          if (notification.uuid === uuid) {
            // Remove the notification at this index
            const result = await redisClient.lrem(
              userKey,
              1,
              userNotificationsData[i]
            )
            console.log(
              `Deleted user notification with UUID ${uuid}, result: ${result}`
            )
            userNotificationDeleted = true
            break
          }
        } catch (e) {
          console.error("Error parsing notification during deletion:", e)
        }
      }

      // Check global notifications (for read status only)
      let globalNotificationMarked = false
      for (let i = 0; i < globalNotificationsData.length; i++) {
        try {
          const notification = JSON.parse(globalNotificationsData[i])
          if (notification.uuid === uuid) {
            // For global notifications, we don't delete them but mark them as read
            // by adding them to the user's read list
            notification.read = true
            await redisClient.lpush(userKey, JSON.stringify(notification))
            await redisClient.expire(userKey, NOTIFICATIONS_TTL)
            console.log(
              `Marked global notification with UUID ${uuid} as read for user ${userKey}`
            )
            globalNotificationMarked = true
            break
          }
        } catch (e) {
          console.error(
            "Error parsing global notification during read marking:",
            e
          )
        }
      }

      if (!userNotificationDeleted && !globalNotificationMarked) {
        console.log(
          `Notification with UUID ${uuid} not found for user ${userKey}`
        )
      }

      return NextResponse.json(
        {
          message: "Notification processed",
          details: {
            userNotificationDeleted,
            globalNotificationMarked,
            uuid,
          },
        },
        { status: 200 }
      )
    } else {
      // Delete all user notifications
      const deletedCount = await redisClient.del(userKey)
      console.log(
        `Deleted ${deletedCount} user notifications for user ${userKey}`
      )

      // For global notifications, mark all as read by adding them to user's read list
      const globalNotificationsData = await redisClient.lrange(
        GLOBAL_NOTIFICATIONS_KEY,
        0,
        -1
      )

      console.log(
        `Marking ${globalNotificationsData.length} global notifications as read for user ${userKey}`
      )

      let markedCount = 0
      for (const item of globalNotificationsData) {
        try {
          const notification = JSON.parse(item)
          notification.read = true
          await redisClient.lpush(userKey, JSON.stringify(notification))
          markedCount++
        } catch (e) {
          console.error("Error marking global notification as read:", e)
        }
      }

      await redisClient.expire(userKey, NOTIFICATIONS_TTL)
      console.log(
        `Successfully marked ${markedCount} global notifications as read for user ${userKey}`
      )

      return NextResponse.json(
        {
          message: "All notifications processed",
          details: {
            userNotificationsDeleted: deletedCount,
            globalNotificationsMarked: markedCount,
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error processing notification(s):", error)
    return NextResponse.json(
      { error: "Failed to process notification(s)", details: String(error) },
      { status: 500 }
    )
  }
}
