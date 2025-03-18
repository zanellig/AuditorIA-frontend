import {
  getGlobalNotificationsChannel,
  getNotificationsChannel,
  getUserNotificationsKey,
} from "@/lib/notifications-utils"
import { NextRequest } from "next/server"

import redisClient from "@/services/redisClient"

// Handle SSE events for real-time notifications
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const userKey = await getUserNotificationsKey()
  const userChannel = getNotificationsChannel(userKey)
  const globalChannel = getGlobalNotificationsChannel()

  // Create a new ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"))

      // Subscribe to Redis pub/sub channels for this user and global notifications
      const subscriber = redisClient.duplicate()
      await subscriber.subscribe(userChannel, globalChannel)

      console.log(`Subscribed to channels: ${userChannel} and ${globalChannel}`)

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
          `Unsubscribing from channels: ${userChannel} and ${globalChannel}`
        )
        subscriber.unsubscribe(userChannel, globalChannel)
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
