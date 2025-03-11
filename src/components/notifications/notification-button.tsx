"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import PulsingDot from "@/components/pulsing-dot"
import {
  useNotifications,
  useNotificationEvents,
} from "@/lib/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { ScrollArea } from "../ui/scroll-area"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Notification } from "@/lib/types"
import { useQueryClient } from "@tanstack/react-query"
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/hooks/use-notifications"

export function NotificationButton() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [optimisticDeletions, setOptimisticDeletions] = useState<Set<string>>(
    new Set()
  )

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications()

  // Setup real-time notifications
  useNotificationEvents()

  // Log notifications for debugging
  useEffect(() => {
    console.log("Current notifications:", notifications)
    console.log("Unread count:", unreadCount)
  }, [notifications, unreadCount])

  // Mark all as read when dropdown is opened
  const handleOpenChange = (isOpen: boolean) => {
    console.log("Dropdown open state changed:", isOpen)
    setOpen(isOpen)
    if (isOpen && unreadCount > 0) {
      console.log("Marking all notifications as read")
      markAllAsRead()
    }
  }

  // Navigate to transcription page
  const navigateToTranscription = (identifier: string, fileName?: string) => {
    const url = `/dashboard/transcription?identifier=${identifier}${fileName ? `&file_name=${fileName}` : ""}`
    console.log("Navigating to:", url)
    router.push(url)
    setOpen(false)
  }

  // Get filtered notifications (excluding optimistically deleted ones)
  const filteredNotifications = notifications.filter(
    notification => !optimisticDeletions.has(notification.uuid)
  )

  // Handle notification deletion with optimistic updates
  const handleDeleteNotification = async (
    notification: Notification,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    try {
      console.log("Deleting notification:", notification.uuid)

      // Optimistically update UI by adding to optimistic deletions set
      setOptimisticDeletions(prev => new Set([...prev, notification.uuid]))

      // Optimistically update the cache
      queryClient.setQueryData(
        [NOTIFICATIONS_QUERY_KEY],
        (oldData: Notification[] | undefined) =>
          oldData ? oldData.filter(n => n.uuid !== notification.uuid) : []
      )

      // Perform the actual deletion
      await deleteNotification(notification.uuid)

      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada correctamente.",
        variant: "default",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error deleting notification:", error)

      // Revert optimistic update on error
      setOptimisticDeletions(prev => {
        const newSet = new Set(prev)
        newSet.delete(notification.uuid)
        return newSet
      })

      // Revert cache update by refetching
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })

      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Handle delete all notifications with optimistic updates
  const handleDeleteAllNotifications = async () => {
    try {
      console.log("Deleting all notifications")

      // Store current notifications for potential rollback
      const previousNotifications = [...notifications]

      // Optimistically update UI by adding all notifications to optimistic deletions
      const notificationIds = notifications.map(n => n.uuid)
      setOptimisticDeletions(prev => new Set([...prev, ...notificationIds]))

      // Optimistically update the cache
      queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY], [])

      // Perform the actual deletion
      deleteAllNotifications()

      toast({
        title: "Notificaciones eliminadas",
        description:
          "Todas las notificaciones han sido eliminadas correctamente.",
        variant: "default",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error deleting all notifications:", error)

      // Revert optimistic update on error
      setOptimisticDeletions(new Set())

      // Revert cache update by refetching
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })

      toast({
        title: "Error",
        description:
          "No se pudieron eliminar todas las notificaciones. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Determine if a notification is a global notification
  const isGlobalNotification = (notification: Notification) => {
    // Use the isGlobal flag if available
    if (typeof notification.isGlobal === "boolean") {
      return notification.isGlobal
    }

    // Fallback to heuristic for older notifications that don't have the flag
    return (
      notification.text.startsWith("System") ||
      notification.text.includes("maintenance") ||
      notification.text.includes("update") ||
      notification.text.includes("feature")
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Bell size={GLOBAL_ICON_SIZE} />
          {unreadCount > 0 && (
            <div className='absolute -top-2 -right-2'>
              <PulsingDot className='text-red-500' size={20} />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <div className='flex items-center justify-between p-2'>
          <h3 className='font-medium'>Notificaciones</h3>
          {filteredNotifications.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleDeleteAllNotifications}
              className='h-auto py-1 px-2 text-xs'
            >
              Limpiar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea>
          <div className='max-h-80'>
            {filteredNotifications.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                No hay notificaciones
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <DropdownMenuItem
                  key={notification.uuid}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    !notification.read && "bg-muted/50"
                  )}
                  onClick={() => {
                    if (notification.task?.identifier) {
                      console.log("Clicked on notification:", notification)
                      navigateToTranscription(
                        notification.task.identifier,
                        notification.task.file_name
                      )
                    }
                  }}
                >
                  <div className='flex w-full justify-between'>
                    <p className='text-sm font-medium'>{notification.text}</p>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 ml-2 -mr-2 opacity-50 hover:opacity-100'
                      onClick={e => handleDeleteNotification(notification, e)}
                    >
                      <span className='sr-only'>Delete</span>
                      <span aria-hidden>×</span>
                    </Button>
                  </div>
                  <div className='flex w-full justify-between items-center'>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {formatDistanceToNow(new Date(notification.timestamp), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                    {isGlobalNotification(notification) && (
                      <span className='text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full'>
                        Global
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className='text-xs text-center text-muted-foreground py-2'>
          Las notificaciones se almacenan por 7 días
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
