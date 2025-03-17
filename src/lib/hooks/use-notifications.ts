import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Notification, Notifications } from "@/lib/types"
import { useEffect } from "react"
import { useNotificationToast } from "@/components/notifications/notification-toast"
import { getHost } from "../actions"
import {
  addEventListener,
  checkAndReconnectEventSource,
} from "../notification-event-source"
import { useUser } from "@/components/context/UserProvider"
import React from "react"

// Query key for notifications
export const NOTIFICATIONS_QUERY_KEY = "notifications"

// Interface for the notifications response
interface NotificationsResponse {
  notifications: Notifications
}

// Function to fetch notifications
async function fetchNotifications(): Promise<Notifications> {
  const host = await getHost()
  const response = await fetch(`${host}/api/notifications`)
  if (!response.ok) {
    throw new Error("Failed to fetch notifications")
  }
  const data: NotificationsResponse = await response.json()
  return data.notifications
}

// Function to mark all notifications as read
async function markAllAsRead(notifications: Notifications): Promise<void> {
  if (!notifications || notifications.length === 0) {
    console.log("No notifications to mark as read")
    return
  }

  console.log(`Marking ${notifications.length} notifications as read`)

  const host = await getHost()

  // Update each notification, preserving all original properties
  await Promise.all(
    notifications.map(async notification => {
      if (notification.read) {
        console.log(
          `Notification ${notification.uuid} already marked as read, skipping`
        )
        return
      }

      // Create an updated notification with read=true, preserving all other properties
      const updatedNotification = {
        ...notification,
        read: true,
      }

      console.log(`Marking notification ${notification.uuid} as read`)

      // Send the updated notification to the API
      return fetch(`${host}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotification),
      })
    })
  )
}

// Function to delete a notification
async function deleteNotification(uuid: string): Promise<void> {
  console.log(`Attempting to delete notification with UUID: ${uuid}`)
  try {
    const host = await getHost()
    const response = await fetch(`${host}/api/notifications?uuid=${uuid}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        `Failed to delete notification: ${response.status} ${response.statusText}`,
        errorData
      )
      throw new Error(`Failed to delete notification: ${response.statusText}`)
    }

    console.log(
      `Successfully deleted/processed notification with UUID: ${uuid}`
    )
    return await response.json()
  } catch (error) {
    console.error("Error in deleteNotification:", error)
    throw error
  }
}

// Function to delete all notifications
async function deleteAllNotifications(): Promise<void> {
  console.log("Attempting to delete all notifications")
  try {
    const host = await getHost()
    const response = await fetch(`${host}/api/notifications`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        `Failed to delete all notifications: ${response.status} ${response.statusText}`,
        errorData
      )
      throw new Error(
        `Failed to delete all notifications: ${response.statusText}`
      )
    }

    console.log("Successfully deleted/processed all notifications")
    return await response.json()
  } catch (error) {
    console.error("Error in deleteAllNotifications:", error)
    throw error
  }
}

// Function to delete all global notifications (admin only)
async function deleteAllGlobalNotifications(
  adminApiKey: string
): Promise<void> {
  console.log("Attempting to delete all global notifications (admin only)")
  try {
    const host = await getHost()
    const response = await fetch(`${host}/api/notifications/admin`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminApiKey}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        `Failed to delete global notifications: ${response.status} ${response.statusText}`,
        errorData
      )
      throw new Error(
        `Failed to delete global notifications: ${response.statusText}`
      )
    }

    console.log("Successfully deleted all global notifications")
    return await response.json()
  } catch (error) {
    console.error("Error in deleteAllGlobalNotifications:", error)
    throw error
  }
}

// Hook to use notifications
export function useNotifications() {
  const queryClient = useQueryClient()
  const { username } = useUser()
  // Query to fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!username,
    staleTime: 10000, // Consider data fresh for 10 seconds to prevent excessive refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus to prevent duplicate notifications
  })

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(notifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })
    },
  })

  // Mutation to delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    // We don't need onSuccess here because we're using optimistic updates
    // The UI will already be updated before the mutation completes
  })

  // Mutation to delete all notifications
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: deleteAllNotifications,
    // We don't need onSuccess here because we're using optimistic updates
    // The UI will already be updated before the mutation completes
  })

  // Mutation to delete all global notifications (admin only)
  const deleteAllGlobalNotificationsMutation = useMutation({
    mutationFn: deleteAllGlobalNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })
    },
  })

  // Function to programmatically send a notification
  const sendNotificationMutation = useMutation({
    mutationFn: async (
      notification: Omit<Notification, "uuid" | "timestamp" | "read"> & {
        isGlobal?: boolean
      }
    ) => {
      const { isGlobal, ...notificationData } = notification

      const response = await fetch(
        `${await getHost()}/api/notifications/webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...notificationData,
            timestamp: Date.now(),
            read: false,
            // Only include userId if it's not a global notification
            ...(isGlobal ? {} : { userId: "current" }),
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send notification")
      }

      return response.json()
    },
  })

  // Count of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteAllNotifications: deleteAllNotificationsMutation.mutate,
    deleteAllGlobalNotifications: deleteAllGlobalNotificationsMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
  }
}

// Hook to setup Server-Sent Events for real-time notifications
export function useNotificationEvents() {
  const queryClient = useQueryClient()
  const { username } = useUser()
  const { showNotificationToast } = useNotificationToast()

  // Use a ref to persist the processed notification IDs between renders
  // This prevents duplicate processing even if the component re-renders
  const processedNotificationIds = React.useRef(new Set<string>())

  useEffect(() => {
    if (!username) return // Don't set up listeners if no username

    console.log("Setting up notification event listeners...")

    // Set up a periodic check to ensure the connection is maintained
    const connectionCheckInterval = setInterval(() => {
      checkAndReconnectEventSource()
    }, 30000) // Check every 30 seconds

    // Use a debounce mechanism to avoid processing too many notifications at once
    let processingQueue: Notification[] = []
    let isProcessing = false

    // Function to process notifications in batches
    const processNotificationQueue = async () => {
      if (isProcessing || processingQueue.length === 0) return

      isProcessing = true
      console.log(`Processing ${processingQueue.length} notifications in queue`)

      // Take a copy of the current queue and clear it
      const currentBatch = [...processingQueue]
      processingQueue = []

      try {
        // Process each notification in the batch
        for (const notification of currentBatch) {
          // Skip processing if we've already processed this notification
          if (processedNotificationIds.current.has(notification.uuid)) {
            console.log(
              "Skipping already processed notification:",
              notification.uuid
            )
            continue
          }

          // Mark this notification as processed
          processedNotificationIds.current.add(notification.uuid)

          // Get current notifications from the cache
          const existingNotifications =
            queryClient.getQueryData<Notifications>([
              NOTIFICATIONS_QUERY_KEY,
            ]) || []

          // Check if this notification already exists in the cache
          const exists = existingNotifications.some(
            n => n.uuid === notification.uuid
          )

          if (!exists) {
            // Update the query cache with the new notification
            queryClient.setQueryData<Notifications>(
              [NOTIFICATIONS_QUERY_KEY],
              oldNotifications => {
                if (!oldNotifications) return [notification]

                // More aggressive deduplication check with multiple conditions
                const isDuplicate = oldNotifications.some(n => {
                  // Check UUID (most reliable)
                  if (n.uuid === notification.uuid) return true

                  return false
                })

                if (isDuplicate) {
                  console.log(
                    "Prevented duplicate notification:",
                    notification.uuid
                  )
                  return oldNotifications
                }

                return [notification, ...oldNotifications]
              }
            )

            // Show a toast notification for the new notification
            // Use setTimeout to avoid blocking the main thread
            setTimeout(() => {
              showNotificationToast(notification)
            }, 0)
          } else {
            console.log(
              "Notification already exists in cache, not adding duplicate:",
              notification.uuid
            )
          }

          // Small delay between processing each notification to avoid UI freezing
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      } catch (error) {
        console.error("Error processing notification batch:", error)
      } finally {
        isProcessing = false

        // If more notifications arrived while processing, process them too
        if (processingQueue.length > 0) {
          setTimeout(processNotificationQueue, 100)
        }
      }
    }

    // Handler for notification events
    const notificationHandler = (event: MessageEvent) => {
      console.log("Notification event received:", event.data)

      try {
        const notification = JSON.parse(event.data) as Notification
        console.log("Parsed notification:", notification)

        // Add the notification to the processing queue
        processingQueue.push(notification)

        // Start processing the queue if not already processing
        if (!isProcessing) {
          setTimeout(processNotificationQueue, 0)
        }
      } catch (error) {
        console.error("Error processing notification:", error)
      }
    }

    // Handler for connected events
    const connectedHandler = (event: MessageEvent) => {
      console.log("Connected event received:", event.data)
    }

    // Register event listeners using our singleton module
    // The addEventListener function returns a cleanup function
    const removeNotificationListener = addEventListener(
      "notification",
      notificationHandler
    )
    const removeConnectedListener = addEventListener(
      "connected",
      connectedHandler
    )

    // Clean up event listeners when the component unmounts
    return () => {
      removeNotificationListener()
      removeConnectedListener()
      clearInterval(connectionCheckInterval)
    }
  }, [username, queryClient, showNotificationToast]) // Include all dependencies
}
