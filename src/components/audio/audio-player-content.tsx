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
  const [fileName, setFileName] = React.useState("")
  const params = useSearchParams()
  const path = usePathname()

  React.useEffect(() => {
    if (path.includes("/transcription")) {
      const newFileName = params.get("file_name")
      if (newFileName && newFileName.length > 0 && newFileName !== null) {
        setFileName(newFileName)
      }
    }
  }, [path, params])

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
