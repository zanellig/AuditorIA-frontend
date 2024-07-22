import { TranscriptionsAPI } from "@/lib/actions"

import TranscriptionClient from "./transcription.client"
import { Task } from "@/lib/types"
import { _transcriptPath, _urlBase } from "@/lib/api/paths"
import LoadingScreen from "../loading-screen"

interface TranscriptionServerProps {
  taskId: Task["identifier"]
}

const TranscriptionServer = async ({ taskId }: TranscriptionServerProps) => {
  const transcriptions = new TranscriptionsAPI(_urlBase, _transcriptPath)

  try {
    const transcription = await transcriptions.getTranscription(taskId, true)

    if (!transcription) return <LoadingScreen />
    return <TranscriptionClient transcription={transcription} taskId={taskId} />
  } catch (error) {
    console.warn("Error fetching transcription:", error)
    throw error
  }
}

export default TranscriptionServer
