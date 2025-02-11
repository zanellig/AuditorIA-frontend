"use client"

import React, { ReactElement } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useAudioPlayer } from "@/components/context/AudioProvider"
import { getAudioPath } from "@/lib/actions"

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

  React.useEffect(() => {
    if (fileName) {
      pause()
      getAudioPath(fileName).then(fileUrl => {
        if (fileUrl) loadAudio(fileUrl)
      })
    }
  }, [fileName, loadAudio, pause])

  return React.cloneElement(children, { fileName })
}

export default AudioPlayerContent
