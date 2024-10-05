"use client"
import FloatingAudioPlayer from "@/components/audio/floating-audio-player"
import { usePathname, useSearchParams } from "next/navigation"
import React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [transcriptionState, setTranscriptionState] = React.useState({
    fileName: "",
  })
  const params = useSearchParams()
  const path = usePathname()

  React.useEffect(() => {
    if (path.includes("/transcription")) {
      const fileName = params.get("file_name")
      if (
        fileName &&
        fileName.length > 0 &&
        fileName !== null &&
        fileName != undefined
      )
        setTranscriptionState({
          fileName: fileName,
        })
    }
  }, [path, params])
  return (
    <>
      {children}
      <FloatingAudioPlayer fileName={transcriptionState.fileName} />
    </>
  )
}
