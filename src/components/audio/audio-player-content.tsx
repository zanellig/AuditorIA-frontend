"use client"

import React, { ReactElement } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useAudioPlayer } from "@/components/context/AudioProvider"
import { useRecordingContext } from "@/components/context/RecordingProvider"

interface AudioPlayerContentProps {
  children: ReactElement<{ fileName?: string }>
}

function AudioPlayerContent({ children }: AudioPlayerContentProps) {
  const { pause, loadAudio } = useAudioPlayer()
  const params = useSearchParams()
  const path = usePathname()

  const fileName = path.includes("/transcription")
    ? (params.get("file_name") ?? "")
    : ""

  const { recordingQuery, setRecording } = useRecordingContext()

  React.useEffect(() => {
    if (fileName) {
      setRecording({ fileName })
    }
  }, [fileName, setRecording])

  React.useEffect(() => {
    if (!recordingQuery.isFetching && recordingQuery.data) {
      pause()
      loadAudio(recordingQuery.data.URL)
    }
  }, [recordingQuery, pause, loadAudio])

  return React.cloneElement(children, { fileName })
}

export default AudioPlayerContent
