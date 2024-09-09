// @/components/context/TranscriptionContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { Task, TranscriptionType } from "@/lib/types.d"

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
  const [err, response] = await fetch(`/api/task?identifier=${taskId}`).then(
    async res => await res.json()
  )
  if (err !== null) {
    throw new Error("Network response was not ok")
  }
  console.log(taskId, response)
  return { taskId, transcription: response }
}

export const TranscriptionProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [taskIdState, setTaskId] = useState<string | null>(null)
  const { data, error, isLoading } = useQuery({
    queryKey: ["transcription", taskIdState],
    queryFn: () => fetchTranscription(taskIdState!),
    enabled: !!taskIdState,
  })

  const handleFetchTranscription = (newTaskId: string) => {
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
