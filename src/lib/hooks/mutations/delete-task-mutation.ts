"use client"
import { useToast } from "@/components/ui/use-toast"
import { getHost } from "@/lib/actions"
import { useMutation } from "@tanstack/react-query"

export const useDeleteTaskMutation = () => {
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (uuid: string) => {
      const url = new URL(`${await getHost()}/api/task`)
      url.searchParams.append("identifier", uuid)
      const res = await fetch(url.toString(), {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Error al borrar la tarea")
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Tarea borrada", variant: "success" })
    },
    onError: error => {
      toast({
        title: error.message,
        variant: "destructive",
      })
    },
  })
}
