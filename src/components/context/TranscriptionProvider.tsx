"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { ITranscription } from "@/lib/types"

interface ITranscriptionContextValue {
  taskId: string | null
  transcription: ITranscription | null
  fetchTranscription: (newTaskId: string) => void
  queryStatus: UseQueryResult<
    { taskId: string; transcription: ITranscription },
    Error
  >
}

const TranscriptionContext = createContext<
  ITranscriptionContextValue | undefined
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
  const taskQuery = useQuery({
    queryKey: ["transcription", taskIdState],
    queryFn: () => fetchTranscription(taskIdState!),
    enabled: !!taskIdState,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const handleFetchTranscription = (newTaskId: string) => {
    queryClient.removeQueries({
      queryKey: ["transcription", taskIdState],
    })
    queryClient.invalidateQueries({
      queryKey: ["transcription", newTaskId],
    })
    setTaskId(newTaskId)
  }

  const contextValue: ITranscriptionContextValue = {
    taskId: taskQuery.data?.taskId || null,
    transcription: taskQuery.data?.transcription || null,
    fetchTranscription: handleFetchTranscription,
    queryStatus: taskQuery,
  }

  return (
    <TranscriptionContext.Provider value={contextValue}>
      {children}
    </TranscriptionContext.Provider>
  )
}
