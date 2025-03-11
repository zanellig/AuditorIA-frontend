import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Notification, Notifications } from "@/lib/types"
import { useEffect } from "react"
import { useNotificationToast } from "@/components/notifications/notification-toast"

// Query key for notifications
export const NOTIFICATIONS_QUERY_KEY = "notifications"

// Interface for the notifications response
interface NotificationsResponse {
  notifications: Notifications
}

// Function to fetch notifications
async function fetchNotifications(): Promise<Notifications> {
  const response = await fetch("/api/notifications")
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

  // Update each notification
  await Promise.all(
    updatedNotifications.map(notification =>
      fetch("/api/notifications", {
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
  const response = await fetch(`/api/notifications?uuid=${uuid}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete notification")
  }
}

// Function to delete all notifications
async function deleteAllNotifications(): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete all notifications")
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
  }
}

// Hook to setup Server-Sent Events for real-time notifications
export function useNotificationEvents() {
  const queryClient = useQueryClient()
  const { showNotificationToast } = useNotificationToast()

  useEffect(() => {
    console.log("Setting up EventSource connection...")

    // Create an EventSource connection
    const eventSource = new EventSource("/api/notifications/events")

    // Connection opened
    eventSource.onopen = () => {
      console.log("EventSource connection established")
    }

    // Listen for new notifications
    eventSource.addEventListener("notification", event => {
      console.log("Notification event received:", event.data)

      try {
        const notification = JSON.parse(event.data) as Notification
        console.log("Parsed notification:", notification)

        // Update the query cache with the new notification
        queryClient.setQueryData<Notifications>(
          [NOTIFICATIONS_QUERY_KEY],
          oldNotifications => {
            console.log("Previous notifications:", oldNotifications)
            if (!oldNotifications) return [notification]
            return [notification, ...oldNotifications]
          }
        )

        // Show a toast notification
        showNotificationToast(notification)
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
