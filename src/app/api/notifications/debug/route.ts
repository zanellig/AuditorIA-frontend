import { NextRequest, NextResponse } from "next/server"
import redisClient from "@/services/redisClient"
import {
  getUserNotificationsKey,
  GLOBAL_NOTIFICATIONS_KEY,
  isAdmin,
} from "@/lib/notifications-utils"

// Debug endpoint to view all notifications (admin only)
export async function GET(request: NextRequest) {
  // Check if user is admin
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Get user-specific key
    const userKey = await getUserNotificationsKey()

    // Get all user notifications
    const userNotifications = await redisClient.lrange(userKey, 0, -1)
    const parsedUserNotifications = userNotifications.map(n => JSON.parse(n))

    // Get all global notifications
    const globalNotifications = await redisClient.lrange(
      GLOBAL_NOTIFICATIONS_KEY,
      0,
      -1
    )
    const parsedGlobalNotifications = globalNotifications.map(n =>
      JSON.parse(n)
    )

    // Get all Redis keys related to notifications
    const keys = await redisClient.keys("notifications:*")

    return NextResponse.json({
      userKey,
      userNotifications: parsedUserNotifications,
      globalNotifications: parsedGlobalNotifications,
      allNotificationKeys: keys,
    })
  } catch (error) {
    console.error("Error fetching debug information:", error)
    return NextResponse.json(
      { error: "Failed to fetch debug information" },
      { status: 500 }
    )
  }
}
