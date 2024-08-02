import { getTask } from "@/lib/actions"

import TranscriptionClient from "./transcription.client"
import { Task, TranscriptionType } from "@/lib/types"
import { _transcriptPath, _urlBase } from "@/lib/api/paths"
import LoadingScreen from "../loading-screen"

interface TranscriptionServerProps {
  taskId: Task["identifier"]
}

const TranscriptionServer = async ({ taskId }: TranscriptionServerProps) => {
  try {
    const transcription = await getTask(
      _urlBase,
      _transcriptPath,
      taskId,
      false
    )

    if (!transcription) return <LoadingScreen />
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

export default TranscriptionServer
