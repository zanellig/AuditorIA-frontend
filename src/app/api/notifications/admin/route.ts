import { NextRequest, NextResponse } from "next/server"
import redisClient from "@/services/redisClient"

// Admin API key should be stored in environment variables
// For development, we'll use a hardcoded value, but in production
// this should be a secure, randomly generated string
const ADMIN_API_KEY =
  process.env.ADMIN_API_KEY || "admin-api-key-secure-random-string"
const GLOBAL_NOTIFICATIONS_KEY = "notifications:global"

// Verify admin API key
function verifyAdminApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const apiKey = authHeader.substring(7) // Remove "Bearer " prefix
  return apiKey === ADMIN_API_KEY
}

// DELETE all global notifications (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin credentials
    if (!verifyAdminApiKey(request)) {
      console.error("Unauthorized attempt to delete global notifications")
      return NextResponse.json(
        { error: "Unauthorized. Admin API key required." },
        { status: 401 }
      )
    }

    console.log("Admin request to delete all global notifications")

    // Get the count of global notifications before deletion
    const globalNotificationsCount = await redisClient.llen(
      GLOBAL_NOTIFICATIONS_KEY
    )

    // Delete all global notifications
    await redisClient.del(GLOBAL_NOTIFICATIONS_KEY)

    console.log(
      `Successfully deleted ${globalNotificationsCount} global notifications`
    )

    return NextResponse.json(
      {
        message: "All global notifications deleted",
        details: {
          deletedCount: globalNotificationsCount,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting global notifications:", error)
    return NextResponse.json(
      {
        error: "Failed to delete global notifications",
        details: String(error),
      },
      { status: 500 }
    )
  }
}

// GET all global notifications (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin credentials
    if (!verifyAdminApiKey(request)) {
      console.error("Unauthorized attempt to view global notifications")
      return NextResponse.json(
        { error: "Unauthorized. Admin API key required." },
        { status: 401 }
      )
    }

    console.log("Admin request to view all global notifications")

    // Get all global notifications
    const globalNotificationsData = await redisClient.lrange(
      GLOBAL_NOTIFICATIONS_KEY,
      0,
      -1
    )

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

    console.log(`Retrieved ${globalNotifications.length} global notifications`)

    return NextResponse.json(
      {
        notifications: globalNotifications,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching global notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch global notifications", details: String(error) },
      { status: 500 }
    )
  }
}
