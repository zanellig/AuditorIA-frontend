import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"

const NOTIFICATIONS_TTL = 60 * 60 * 24 * 7 // 7 days

// Get user-specific Redis key for notifications
async function getUserNotificationsKey(userId = "anonymous") {
  return `notifications:${userId}`
}

// POST a new notification via webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract user ID from the request if provided
    const userId = body.userId || "anonymous"

    const notification = {
      uuid: body.uuid || randomUUID(),
      timestamp: body.timestamp || Date.now(),
      read: false,
      text: body.text,
      task: body.task,
    }

    // Validate notification
    const validatedNotification = notificationSchema.parse(notification)

    // Get the user-specific key
    const key = await getUserNotificationsKey(userId)

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
