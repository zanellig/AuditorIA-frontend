import { NextResponse } from "next/server"
import redisClient from "@/services/redisClient"
import { cookies } from "next/headers"

// Function to get user-specific Redis key for notifications
async function getUserNotificationsKey() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")
  const userId = sessionCookie?.value
    ? sessionCookie.value.split(" ")[1].substring(0, 10)
    : "anonymous"
  return `notifications:${userId}`
}

export async function GET() {
  try {
    // Check Redis connection
    const pingResult = await redisClient.ping()

    // Get all keys with the notifications prefix
    const allKeys = await redisClient.keys("auditoria:notifications:*")

    // Get the current user's notifications key
    const userKey = await getUserNotificationsKey()
    const fullUserKey = `auditoria:${userKey}`

    // Get notifications for the current user
    const notificationsData = await redisClient.lrange(userKey, 0, -1)

    // Parse notifications
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

    // Get all pub/sub channels
    const pubsubChannels = await redisClient.pubsub(
      "CHANNELS",
      "notification:*"
    )

    return NextResponse.json(
      {
        redisStatus: pingResult === "PONG" ? "connected" : "error",
        allNotificationKeys: allKeys,
        currentUserKey: fullUserKey,
        notifications,
        pubsubChannels,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { error: "Debug endpoint error", details: String(error) },
      { status: 500 }
    )
  }
}
