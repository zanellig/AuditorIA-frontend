// @/components/context/TranscriptionContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Task, TranscriptionType } from "@/lib/types.d"
import { getHost } from "@/lib/actions"

interface TranscriptionContextType {
  taskId: Task["identifier"] | null
  transcription: TranscriptionType | null
  isLoading: boolean
  error: Error | undefined | null
  fetchTranscription: (taskId: string) => any
}

const TranscriptionContext = createContext<
  TranscriptionContextType | undefined
>(undefined)

export const useTranscription = () => {
  const context = useContext(TranscriptionContext)
  if (!context) {
    throw new Error(
      "useTranscription must be used within a TranscriptionProvider"
    )
  }
  return context
}

const fetchTranscription = async (taskId: string) => {
  const [err, response] = await fetch(
    `${await getHost()}/api/task?identifier=${taskId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  ).then(async res => {
    if (res.ok) {
      return await res.json()
    }
    return [new Error(res.statusText), null]
  })
  if (err !== null) {
    throw new Error(err.message)
  }
  return { taskId, transcription: response }
}

export const TranscriptionProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const queryClient = useQueryClient()
  const [taskIdState, setTaskId] = useState<string | null>(null)
  const { data, error, isLoading } = useQuery({
    queryKey: ["transcription", taskIdState],
    queryFn: () => fetchTranscription(taskIdState!),
    enabled: !!taskIdState,
    refetchOnMount: true,
  })

  const handleFetchTranscription = (newTaskId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["transcription", newTaskId],
    })
    setTaskId(newTaskId)
  }

  return (
    <TranscriptionContext.Provider
      value={{
        taskId: data?.taskId || "",
        transcription: data?.transcription,
        isLoading,
        error,
        fetchTranscription: handleFetchTranscription,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  )
}
