import * as React from "react"
import { type ButtonProps } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { StatefulButton } from "./stateful-button"
import { cn } from "@/lib/utils"

export interface AnalyzeTaskButtonProps extends ButtonProps {
  taskId: string
}

const analyzeTask = async (taskId: string) => {
  const url = new URL(`${await getHost()}/api/task`)
  url.searchParams.set("identifier", taskId)
  const response = await fetch(url, {
    method: "PUT",
  })
  if (!response.ok) throw new Error(response.statusText)
  const data = await response.json()
  return data
}

export const AnalyzeTaskButton = React.forwardRef<
  HTMLButtonElement,
  AnalyzeTaskButtonProps
>(({ taskId, className, ...props }, ref) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ["analyze-task", taskId],
    mutationFn: analyzeTask,
    onSuccess: data => {
      toast({ title: "Tarea analizada", description: data.message })
      queryClient.invalidateQueries({
        queryKey: ["transcription", taskId],
        exact: true,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Ocurrió un error analizando la tarea",
        variant: "destructive",
      })
    },
  })
  return (
    <StatefulButton
      className={cn(className, "w-full lg:w-32")}
      ref={ref}
      onClick={() => {
        toast({ title: "La tarea se está analizando...", description: taskId })
        mutation.mutate(taskId)
      }}
      isLoading={mutation.isPending}
      {...props}
      variant={"shine"}
    >
      Analizar tarea
    </StatefulButton>
  )
})

AnalyzeTaskButton.displayName = "AnalyzeTaskButton"
