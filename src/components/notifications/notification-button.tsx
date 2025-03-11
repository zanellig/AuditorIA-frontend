"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
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

export function NotificationButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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
          {notifications.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                console.log("Deleting all notifications")
                deleteAllNotifications()
              }}
              className='h-auto py-1 px-2 text-xs'
            >
              Limpiar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea>
          <div className='max-h-80'>
            {notifications.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                No hay notificaciones
              </div>
            ) : (
              notifications.map(notification => (
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
                      onClick={e => {
                        e.stopPropagation()
                        console.log("Deleting notification:", notification.uuid)
                        deleteNotification(notification.uuid)
                      }}
                    >
                      <span className='sr-only'>Delete</span>
                      <span aria-hidden>×</span>
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
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
