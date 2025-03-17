import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import redisClient from "@/services/redisClient"
import { notificationSchema } from "@/lib/types"
import {
  getUserNotificationsKey,
  GLOBAL_NOTIFICATIONS_KEY,
  NOTIFICATIONS_TTL,
  getNotificationsChannel,
  getGlobalNotificationsChannel,
  isAdmin,
  getNotificationsKeyForUser,
} from "@/lib/notifications-utils"
import { getHeaders } from "@/lib/get-headers"

/**
 * Unified Notification System
 *
 * This file contains all API endpoints for the notification system:
 * - GET: Retrieve notifications for the current user
 * - POST: Create a new notification (can be user-specific or global)
 * - DELETE: Delete notifications (specific one or all)
 * - GET /events: SSE endpoint for real-time notifications
 *
 * The system follows these rules:
 * - Admin can post a notification globally or by passing a username
 * - Only one route posts notifications to Redis
 * - Only one route gets notifications
 * - Only one route emits events and sends & receives messages
 */

// GET all notifications for the current user, including global notifications
export async function GET(request: NextRequest) {
  // Handle SSE events route
  const { pathname } = new URL(request.url)

  if (pathname.endsWith("/events")) {
    return handleSSEEvents(request)
  }

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
      { status: 200, headers: await getHeaders(request) }
    )
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// POST a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if this is an admin operation targeting a specific user or sending globally
    const isAdminRequest = body.isAdminRequest === true
    let targetUser = body.targetUser

    // Validate admin rights if this is an admin request
    if (isAdminRequest && !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403, headers: await getHeaders(request) }
      )
    }

    // Determine if this is a global notification
    const isGlobalNotification = isAdminRequest && !targetUser

    // Create the notification object
    const notification = {
      uuid: body.uuid || randomUUID(),
      timestamp: body.timestamp || Date.now(),
      read: body.read !== undefined ? body.read : false,
      text: body.text,
      task: body.task,
      isGlobal: isGlobalNotification,
    }

    // Validate notification
    const validatedNotification = notificationSchema.parse(notification)

    // Determine the Redis key to use
    let key
    if (isGlobalNotification) {
      key = GLOBAL_NOTIFICATIONS_KEY
    } else if (isAdminRequest && targetUser) {
      key = getNotificationsKeyForUser(targetUser)
    } else {
      key = await getUserNotificationsKey()
    }

    // Process the notification asynchronously
    const processNotificationPromise = (async () => {
      try {
        // Check if this notification already exists (by uuid)
        const existingNotifications = await redisClient.lrange(key, 0, -1)
        let existingNotificationJson = null

        for (const item of existingNotifications) {
          try {
            const parsedItem = JSON.parse(item)
            if (parsedItem.uuid === validatedNotification.uuid) {
              existingNotificationJson = item
              break
            }
          } catch {
            continue
          }
        }

        if (existingNotificationJson) {
          console.log(
            `Notification with UUID ${validatedNotification.uuid} already exists, updating it`
          )

          // Remove the existing notification
          await redisClient.lrem(key, 0, existingNotificationJson)

          // Add the updated notification to the beginning of the list
          await redisClient.lpush(key, JSON.stringify(validatedNotification))

          // Set expiration on the key if it doesn't exist
          await redisClient.expire(key, NOTIFICATIONS_TTL)

          console.log(
            `Notification ${validatedNotification.uuid} updated successfully`
          )

          // Publish the updated notification
          if (isGlobalNotification) {
            // For global notifications, publish to the global channel
            const globalChannel = getGlobalNotificationsChannel()
            await redisClient.publish(
              globalChannel,
              JSON.stringify(validatedNotification)
            )
          } else {
            // For user-specific notifications, publish to the user's channel
            const userChannel = getNotificationsChannel(key)
            await redisClient.publish(
              userChannel,
              JSON.stringify(validatedNotification)
            )
          }

          return
        }

        // Add notification to the beginning of the list
        await redisClient.lpush(key, JSON.stringify(validatedNotification))

        // Set expiration on the key if it doesn't exist
        await redisClient.expire(key, NOTIFICATIONS_TTL)

        // Publish the notification to the appropriate channel for real-time updates
        if (isGlobalNotification) {
          // For global notifications, publish to the global channel
          const globalChannel = getGlobalNotificationsChannel()
          await redisClient.publish(
            globalChannel,
            JSON.stringify(validatedNotification)
          )
          console.log(
            `Global notification ${validatedNotification.uuid} published`
          )
        } else {
          // For user-specific notifications, publish to the user's channel
          const userChannel = getNotificationsChannel(key)
          await redisClient.publish(
            userChannel,
            JSON.stringify(validatedNotification)
          )
          console.log(
            `User notification ${validatedNotification.uuid} published to ${key}`
          )
        }

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
    return NextResponse.json(
      {
        ...validatedNotification,
        isGlobal: isGlobalNotification,
      },
      {
        status: 201,
        headers: await getHeaders(request),
      }
    )
  } catch (error) {
    console.error("Error creating notification:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400, headers: await getHeaders(request) }
      )
    }
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// DELETE a notification or all notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uuid = searchParams.get("uuid")
    const userKey = await getUserNotificationsKey()

    // Check for admin operations
    const isAdminRequest = searchParams.get("isAdmin") === "true"

    if (isAdminRequest && !(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403, headers: await getHeaders(request) }
      )
    }

    console.log(
      `DELETE request received. UUID: ${uuid || "all"}, User key: ${userKey}, Admin: ${isAdminRequest}`
    )

    if (isAdminRequest && !uuid) {
      // Admin deleting all global notifications
      const deletedCount = await redisClient.del(GLOBAL_NOTIFICATIONS_KEY)
      console.log(`Deleted ${deletedCount} global notifications`)

      return NextResponse.json(
        {
          message: "All global notifications deleted",
          details: { deletedCount },
        },
        { status: 200, headers: await getHeaders(request) }
      )
    }

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

      // Handle admin deleting global notification
      if (isAdminRequest && !userNotificationDeleted) {
        for (let i = 0; i < globalNotificationsData.length; i++) {
          try {
            const notification = JSON.parse(globalNotificationsData[i])
            if (notification.uuid === uuid) {
              // Remove the global notification
              const result = await redisClient.lrem(
                GLOBAL_NOTIFICATIONS_KEY,
                1,
                globalNotificationsData[i]
              )
              console.log(
                `Admin deleted global notification with UUID ${uuid}, result: ${result}`
              )
              return NextResponse.json(
                { message: `Global notification with UUID ${uuid} deleted` },
                { status: 200, headers: await getHeaders(request) }
              )
            }
          } catch (e) {
            console.error(
              "Error parsing global notification during deletion:",
              e
            )
          }
        }
      }

      // For regular users, handle global notifications (for read status only)
      let globalNotificationMarked = false
      if (!isAdminRequest) {
        for (let i = 0; i < globalNotificationsData.length; i++) {
          try {
            const notification = JSON.parse(globalNotificationsData[i])
            if (notification.uuid === uuid) {
              // For global notifications, we don't delete them but mark them as read
              notification.read = true

              // Remove any existing copies of this notification from the user's list
              const userNotifications = await redisClient.lrange(userKey, 0, -1)
              for (const item of userNotifications) {
                try {
                  const existingNotification = JSON.parse(item)
                  if (existingNotification.uuid === uuid) {
                    await redisClient.lrem(userKey, 0, item)
                    console.log(
                      `Removed existing notification with UUID ${uuid} from user ${userKey}`
                    )
                  }
                } catch (e) {
                  console.error("Error parsing notification during removal:", e)
                }
              }

              // Add the updated notification with read=true
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
        { status: 200, headers: await getHeaders(request) }
      )
    } else {
      // Delete all user notifications
      const deletedCount = await redisClient.del(userKey)
      console.log(
        `Deleted ${deletedCount} user notifications for user ${userKey}`
      )

      // For global notifications, mark all as read
      const globalNotificationsData = await redisClient.lrange(
        GLOBAL_NOTIFICATIONS_KEY,
        0,
        -1
      )

      console.log(
        `Marking ${globalNotificationsData.length} global notifications as read for user ${userKey}`
      )

      // First, get all existing notifications for the user to check for duplicates
      const existingUserNotifications = await redisClient.lrange(userKey, 0, -1)
      const existingGlobalIds = new Set()

      // Extract UUIDs of global notifications that might already be in the user's list
      for (const item of existingUserNotifications) {
        try {
          const notification = JSON.parse(item)
          if (notification.isGlobal) {
            existingGlobalIds.add(notification.uuid)
          }
        } catch (e) {
          console.error("Error parsing existing notification:", e)
        }
      }

      let markedCount = 0
      for (const item of globalNotificationsData) {
        try {
          const notification = JSON.parse(item)
          notification.read = true

          // If this global notification is already in the user's list, update it
          if (existingGlobalIds.has(notification.uuid)) {
            // Remove the existing version first
            for (const existingItem of existingUserNotifications) {
              try {
                const existingNotification = JSON.parse(existingItem)
                if (existingNotification.uuid === notification.uuid) {
                  await redisClient.lrem(userKey, 0, existingItem)
                  console.log(
                    `Removed existing global notification with UUID ${notification.uuid}`
                  )
                  break
                }
              } catch (e) {
                continue
              }
            }
          }

          // Add the updated notification with read=true
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
        { status: 200, headers: await getHeaders(request) }
      )
    }
  } catch (error) {
    console.error("Error processing notification(s):", error)
    return NextResponse.json(
      { error: "Failed to process notification(s)", details: String(error) },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// Handle SSE events for real-time notifications
async function handleSSEEvents(request: NextRequest) {
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
