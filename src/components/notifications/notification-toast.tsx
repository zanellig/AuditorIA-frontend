"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Notification } from "@/lib/types"

export function useNotificationToast() {
  const { toast } = useToast()
  const router = useRouter()

  const showNotificationToast = (notification: Notification) => {
    if (notification.task?.identifier) {
      toast({
        title: "Nueva notificación",
        description: notification.text,
        variant: "default",
        duration: 5000,
        action: (
          <ToastAction
            altText='Ver'
            onClick={() => {
              router.push(
                `/dashboard/transcription?identifier=${notification.task?.identifier}${
                  notification.task?.file_name
                    ? `&file_name=${notification.task.file_name}`
                    : ""
                }`
              )
            }}
          >
            Ver
          </ToastAction>
        ),
      })
    } else {
      toast({
        title: "Nueva notificación",
        description: notification.text,
        variant: "default",
        duration: 5000,
      })
    }
  }

  return { showNotificationToast }
}
