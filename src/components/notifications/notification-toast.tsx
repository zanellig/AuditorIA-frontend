"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Notification } from "@/lib/types"

export function useNotificationToast() {
  const { toast } = useToast()
  const router = useRouter()

  const showNotificationToast = (notification: Notification) => {
    // Don't show toast if the notification is global
    if (notification.isGlobal) return

    console.log("Showing toast for notification:", notification.uuid)

    try {
      if (notification.task?.identifier) {
        const url = `/dashboard/transcription?identifier=${notification.task.identifier}${
          notification.task.file_name
            ? `&file_name=${notification.task.file_name}`
            : ""
        }`

        toast({
          title: "Nueva notificación",
          description: notification.text,
          variant: "default",
          duration: 2000,
          action: (
            <ToastAction altText='Ver' onClick={() => router.push(url)}>
              Ver
            </ToastAction>
          ),
        })
      } else {
        toast({
          title: "Nueva notificación",
          description: notification.text,
          variant: "default",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error showing toast:", error)

      // Fallback to simpler toast if there's an error
      toast({
        title: "Nueva notificación",
        description: notification.text,
        variant: "default",
        duration: 2000,
      })
    }
  }

  return { showNotificationToast }
}
