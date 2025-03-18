"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Loader2 } from "lucide-react"
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
import { useNotifications } from "@/lib/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { ScrollArea } from "../ui/scroll-area"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Notification } from "@/lib/types"
import { useQueryClient } from "@tanstack/react-query"
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/hooks/use-notifications"

// Export a memoized version of the component to prevent unnecessary re-renders
export const NotificationButton = memo(function NotificationButton() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [optimisticDeletions, setOptimisticDeletions] = useState<Set<string>>(
    new Set()
  )
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // useNotifications hook provides the notifications state and operations
  const {
    notifications,
    unreadCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications()

  // Set up scroll listener when dropdown is open
  useEffect(() => {
    if (!open) return

    const checkForInfiniteScroll = () => {
      if (!scrollAreaRef.current) return

      // Find the viewport element inside the ScrollArea
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (!viewport || !(viewport instanceof HTMLElement)) return

      const isNearBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        console.log("Loading more notifications...")
        fetchNextPage()
      }
    }

    // Get the viewport element
    const scrollAreaElement = scrollAreaRef.current
    if (!scrollAreaElement) return

    const viewport = scrollAreaElement.querySelector(
      "[data-radix-scroll-area-viewport]"
    )
    if (!viewport) return

    // Add scroll event listener
    viewport.addEventListener("scroll", checkForInfiniteScroll)

    // Initial check in case we start near the bottom
    checkForInfiniteScroll()

    return () => {
      viewport.removeEventListener("scroll", checkForInfiniteScroll)
    }
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Mark all as read when dropdown is opened
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      // console.log("Dropdown open state changed:", isOpen)
      setOpen(isOpen)
      return
      if (isOpen && unreadCount > 0) {
        console.log("Marking all notifications as read")
        markAllAsRead()
      }
    },
    [unreadCount]
  )

  // Navigate to transcription page
  const navigateToTranscription = useCallback(
    (identifier: string, fileName?: string) => {
      const url = `/dashboard/transcription?identifier=${identifier}${fileName ? `&file_name=${fileName}` : ""}`
      console.log("Navigating to:", url)
      router.push(url)
      setOpen(false)
    },
    [router]
  )

  // Get filtered notifications (excluding optimistically deleted ones)
  const filteredNotifications = notifications.filter(
    notification => !optimisticDeletions.has(notification.uuid)
  )

  // Handle notification deletion
  const handleDeleteNotification = useCallback(
    async (notification: Notification, e: React.MouseEvent) => {
      e.stopPropagation()

      console.log("Deleting notification:", notification.uuid)

      // Perform the actual deletion
      deleteNotification(notification.uuid)
    },
    [deleteNotification]
  )

  // Handle delete all notifications
  const handleDeleteAllNotifications = useCallback(async () => {
    deleteAllNotifications()
  }, [deleteAllNotifications])

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
        <ScrollArea className='relative' ref={scrollAreaRef}>
          <div className='max-h-80'>
            {filteredNotifications.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                No hay notificaciones
              </div>
            ) : (
              <>
                {filteredNotifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.uuid}
                    className={cn(
                      "flex flex-col items-start p-3 cursor-pointer",
                      !notification.read && "bg-muted/50"
                    )}
                    onClick={() => {
                      if (notification.task?.identifier) {
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
                    {notification.task ? (
                      <p className='text-xs text-muted-foreground mt-1'>
                        {notification.task?.identifier}
                      </p>
                    ) : null}
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
                ))}
                {isFetchingNextPage && (
                  <div className='flex justify-center p-4'>
                    <Loader2 size={GLOBAL_ICON_SIZE} className='animate-spin' />
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className='text-xs text-center text-muted-foreground py-2'>
          Las notificaciones se almacenan por 24 horas
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
