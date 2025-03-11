import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"
import { cookies } from "next/headers"

const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days

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

// GET all notifications for the current user
export async function GET() {
  try {
    const key = await getUserNotificationsKey()
    const notificationsData = await redisClient.lrange(key, 0, -1)

    const notifications = notificationsData
      .map(item => {
        try {
          return JSON.parse(item)
        } catch (e) {
          console.error("Error parsing notification:", e)
          return null
        }
      })
      .filter(Boolean)

    return NextResponse.json({ notifications }, { status: 200 })
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
      return NextResponse.json(validatedNotification, { status: 200 })
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
    const key = await getUserNotificationsKey()

    if (uuid) {
      // Delete specific notification
      const notificationsData = await redisClient.lrange(key, 0, -1)

      for (let i = 0; i < notificationsData.length; i++) {
        try {
          const notification = JSON.parse(notificationsData[i])
          if (notification.uuid === uuid) {
            // Remove the notification at this index
            await redisClient.lrem(key, 1, notificationsData[i])
            break
          }
        } catch (e) {
          console.error("Error parsing notification during deletion:", e)
        }
      }

      return NextResponse.json(
        { message: "Notification deleted" },
        { status: 200 }
      )
    } else {
      // Delete all notifications
      await redisClient.del(key)
      return NextResponse.json(
        { message: "All notifications deleted" },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error deleting notification(s):", error)
    return NextResponse.json(
      { error: "Failed to delete notification(s)" },
      { status: 500 }
    )
  }
}
