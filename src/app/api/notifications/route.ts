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

export const dynamic = "force-dynamic"

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
  const { searchParams } = new URL(request.url)

  try {
    const userKey = await getUserNotificationsKey()
    const cursor = parseInt(searchParams.get("cursor") || "0")
    const pageSize = 10 // Number of notifications per page

    // Calculate Redis list range indices
    const start = cursor
    const end = cursor + pageSize - 1

    // Fetch both user-specific and global notifications with pagination
    const [userNotificationsData, globalNotificationsData] = await Promise.all([
      redisClient.lrange(userKey, start, end),
      redisClient.lrange(GLOBAL_NOTIFICATIONS_KEY, start, end),
    ])

    // Get total counts for pagination
    const [userTotal, globalTotal] = await Promise.all([
      redisClient.llen(userKey),
      redisClient.llen(GLOBAL_NOTIFICATIONS_KEY),
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

    // Calculate if there are more pages
    const total = userTotal + globalTotal
    const hasMore = cursor + pageSize < total
    const nextCursor = hasMore ? cursor + pageSize : null
    const pages = Math.ceil(total / pageSize)

    return NextResponse.json(
      {
        notifications: allNotifications,
        total,
        pages,
        nextCursor,
      },
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
    let targetUser = body.targetUser

    // Determine if this is a global notification
    const isGlobalNotification = !targetUser

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
    } else if (targetUser) {
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
    const body = await request.json()
    console.log(
      `DELETE request received. UUID: ${uuid || "all"}, User key: ${userKey}`
    )

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
      if (!userNotificationDeleted) {
        for (let i = 0; i < globalNotificationsData.length; i++) {
          try {
            const notification = JSON.parse(globalNotificationsData[i])
            if (notification.uuid === uuid) {
              // Remove the global notification
              return NextResponse.json(
                {
                  error:
                    "Solo los administradores pueden eliminar notificaciones globales",
                },
                {
                  status: 403,
                  statusText: "Forbidden",
                  headers: await getHeaders(request),
                }
              )
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

      return NextResponse.json(
        {
          message: "Notificación procesada",
          details: {
            userNotificationDeleted,
            uuid,
          },
        },
        { status: 200, headers: await getHeaders(request) }
      )
    } else {
      if (body.adminSecret === process.env.ADMIN_API_KEY) {
        // Delete all global notifications
        const deletedCount = await redisClient.del(GLOBAL_NOTIFICATIONS_KEY)
        console.log(`Deleted ${deletedCount} global notifications`)
        return NextResponse.json(
          { message: "Todas las notificaciones globales eliminadas" },
          { status: 200, headers: await getHeaders(request) }
        )
      }
      // Delete all user notifications
      const deletedCount = await redisClient.del(userKey)
      console.log(
        `Deleted ${deletedCount} user notifications for user ${userKey}`
      )

      await redisClient.expire(userKey, NOTIFICATIONS_TTL)

      return NextResponse.json(
        {
          message: "Todas las notificaciones procesadas",
          details: {
            userNotificationsDeleted: deletedCount,
          },
        },
        { status: 200, headers: await getHeaders(request) }
      )
    }
  } catch (error) {
    console.error("Error procesando notificación(es):", error)
    return NextResponse.json(
      { error: "Error al procesar notificación(es)", details: String(error) },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}
