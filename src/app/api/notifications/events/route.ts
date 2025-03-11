import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import redisClient from "@/services/redisClient"

// Function to get user-specific Redis key for notifications
async function getUserNotificationsKey() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")
  const userId = sessionCookie?.value
    ? sessionCookie.value.split(" ")[1].substring(0, 10)
    : "anonymous"
  return `notifications:${userId}`
}

// Global notifications channel
const GLOBAL_CHANNEL = "notification:global"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const userKey = await getUserNotificationsKey()
  const userChannel = `notification:${userKey}`

  // Create a new ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"))

      // Subscribe to Redis pub/sub channels for this user and global notifications
      const subscriber = redisClient.duplicate()
      await subscriber.subscribe(userChannel, GLOBAL_CHANNEL)

      console.log(
        `Subscribed to channels: ${userChannel} and ${GLOBAL_CHANNEL}`
      )

      // Listen for messages on the channels
      subscriber.on("message", (channel, message) => {
        try {
          console.log(`Received message on channel ${channel}:`, message)
          // Send the notification as an event
          controller.enqueue(
            encoder.encode(`event: notification\ndata: ${message}\n\n`)
          )
        } catch (error) {
          console.error("Error sending notification event:", error)
        }
      })

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        console.log(
          `Unsubscribing from channels: ${userChannel} and ${GLOBAL_CHANNEL}`
        )
        subscriber.unsubscribe(userChannel, GLOBAL_CHANNEL)
        subscriber.quit()
        controller.close()
      })
    },
  })

  // Return the stream as a Server-Sent Events response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
