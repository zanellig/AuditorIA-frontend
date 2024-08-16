import { getTask } from "@/lib/actions"

import TranscriptionClient from "./transcription.client"
import { Task, TranscriptionType } from "@/lib/types"
import { TASK_PATH, URL_API_MAIN } from "@/lib/consts"

interface TranscriptionServerProps {
  taskId: Task["identifier"]
}

export default async function TranscriptionServer({
  taskId,
}: TranscriptionServerProps) {
  try {
    const response = await fetch("/api/task?identifier=" + taskId, {
      method: "GET",
    })
    const transcription = JSON.parse(await response.text())

    return (
      <TranscriptionClient
        transcription={transcription as TranscriptionType}
        taskId={taskId}
      />
    )
  } catch (error) {
    console.warn("Error fetching transcription:", error)
    throw error
  }
}
