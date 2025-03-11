import { NextRequest, NextResponse } from "next/server"
import redisClient from "@/services/redisClient"
import {
  GLOBAL_NOTIFICATIONS_KEY,
  NOTIFICATIONS_TTL,
  getGlobalNotificationsChannel,
  isAdmin,
} from "@/lib/notifications-utils"

// Admin-only endpoint to manage global notifications
export async function GET(request: NextRequest) {
  // Check if user is admin
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Get all global notifications
    const notifications = await redisClient.lrange(
      GLOBAL_NOTIFICATIONS_KEY,
      0,
      -1
    )
    const parsedNotifications = notifications.map(n => JSON.parse(n))

    return NextResponse.json({ notifications: parsedNotifications })
  } catch (error) {
    console.error("Error fetching global notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch global notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Check if user is admin
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const data = await request.json()

    if (!data.message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Create notification object
    const notification = {
      id: crypto.randomUUID(),
      message: data.message,
      type: data.type || "info",
      title: data.title || "System Notification",
      timestamp: new Date().toISOString(),
      global: true,
      ...data,
    }

    // Store in Redis
    await redisClient.lpush(
      GLOBAL_NOTIFICATIONS_KEY,
      JSON.stringify(notification)
    )
    await redisClient.expire(GLOBAL_NOTIFICATIONS_KEY, NOTIFICATIONS_TTL)

    // Publish to global channel
    const channel = getGlobalNotificationsChannel()
    await redisClient.publish(channel, JSON.stringify(notification))

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("Error creating global notification:", error)
    return NextResponse.json(
      { error: "Failed to create global notification" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Check if user is admin
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      // Delete all global notifications
      await redisClient.del(GLOBAL_NOTIFICATIONS_KEY)
      return NextResponse.json({
        success: true,
        message: "All global notifications deleted",
      })
    }

    // Get all notifications
    const notifications = await redisClient.lrange(
      GLOBAL_NOTIFICATIONS_KEY,
      0,
      -1
    )

    // Filter out the notification to delete
    const updatedNotifications = notifications.filter(n => {
      const notification = JSON.parse(n)
      return notification.id !== id
    })

    // Delete the key and re-add filtered notifications
    await redisClient.del(GLOBAL_NOTIFICATIONS_KEY)

    if (updatedNotifications.length > 0) {
      await redisClient.lpush(GLOBAL_NOTIFICATIONS_KEY, ...updatedNotifications)
      await redisClient.expire(GLOBAL_NOTIFICATIONS_KEY, NOTIFICATIONS_TTL)
    }

    return NextResponse.json({
      success: true,
      message: `Notification ${id} deleted`,
    })
  } catch (error) {
    console.error("Error deleting global notification:", error)
    return NextResponse.json(
      { error: "Failed to delete global notification" },
      { status: 500 }
    )
  }
}
