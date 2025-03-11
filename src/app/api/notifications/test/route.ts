import { NextRequest, NextResponse } from "next/server"
import redisClient from "@/services/redisClient"
import {
  getUserNotificationsKey,
  getNotificationsChannel,
  GLOBAL_NOTIFICATIONS_KEY,
  getGlobalNotificationsChannel,
  NOTIFICATIONS_TTL,
} from "@/lib/notifications-utils"

// Test endpoint to create sample notifications
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get("count") || "1", 10)
    const global = searchParams.get("global") === "true"

    const results = []

    for (let i = 0; i < count; i++) {
      // Create notification object
      const notification = {
        id: crypto.randomUUID(),
        message: `Test notification #${i + 1}`,
        type: ["info", "success", "warning", "error"][
          Math.floor(Math.random() * 4)
        ],
        title: "Test Notification",
        timestamp: new Date().toISOString(),
        global: global,
      }

      // Determine the key and channel based on global flag
      const key = global
        ? GLOBAL_NOTIFICATIONS_KEY
        : await getUserNotificationsKey()
      const channel = global
        ? getGlobalNotificationsChannel()
        : getNotificationsChannel(key)

      // Store in Redis
      await redisClient.lpush(key, JSON.stringify(notification))
      await redisClient.expire(key, NOTIFICATIONS_TTL)

      // Publish to channel
      await redisClient.publish(channel, JSON.stringify(notification))

      results.push(notification)
    }

    return NextResponse.json({
      success: true,
      count,
      global,
      notifications: results,
    })
  } catch (error) {
    console.error("Error creating test notifications:", error)
    return NextResponse.json(
      { error: "Failed to create test notifications" },
      { status: 500 }
    )
  }
}
