import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Notification, Notifications } from "@/lib/types"
import { useEffect } from "react"
import { useNotificationToast } from "@/components/notifications/notification-toast"
import { getHost } from "../actions"

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
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true,
  }))

  const host = await getHost()

  // Update each notification
  await Promise.all(
    updatedNotifications.map(async notification =>
      fetch(`${host}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      })
    )
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

// Hook to use notifications
export function useNotifications() {
  const queryClient = useQueryClient()

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })
    },
  })

  // Mutation to delete all notifications
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: deleteAllNotifications,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })
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
    sendNotification: sendNotificationMutation.mutate,
  }
}

// Hook to setup Server-Sent Events for real-time notifications
export function useNotificationEvents() {
  const queryClient = useQueryClient()
  const { showNotificationToast } = useNotificationToast()

  useEffect(() => {
    console.log("Setting up EventSource connection...")

    // Create an EventSource connection
    const eventSource = new EventSource(`/api/notifications/events`)

    // Connection opened
    eventSource.onopen = () => {
      console.log("EventSource connection established")
    }

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
          // Get current notifications from the cache
          const existingNotifications =
            queryClient.getQueryData<Notifications>([
              NOTIFICATIONS_QUERY_KEY,
            ]) || []

          // Check if this notification already exists
          const exists = existingNotifications.some(
            n => n.uuid === notification.uuid
          )

          if (!exists) {
            // Update the query cache with the new notification
            queryClient.setQueryData<Notifications>(
              [NOTIFICATIONS_QUERY_KEY],
              oldNotifications => {
                if (!oldNotifications) return [notification]
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
              "Notification already exists, not adding duplicate:",
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

    // Listen for new notifications
    eventSource.addEventListener("notification", event => {
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
    })

    // Listen for connected event
    eventSource.addEventListener("connected", event => {
      console.log("Connected event received:", event.data)
    })

    // Handle connection errors
    eventSource.onerror = error => {
      console.error("EventSource error:", error)
      // Don't close the connection on error, let it retry automatically
    }

    // Clean up the connection when the component unmounts
    return () => {
      console.log("Closing EventSource connection...")
      eventSource.close()
    }
  }, [queryClient, showNotificationToast])
}
