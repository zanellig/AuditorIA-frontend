"use client"
import FloatingAudioPlayer from "@/components/audio/floating-audio-player"
import { AudioProvider } from "@/components/context/AudioProvider"
import { usePathname, useSearchParams } from "next/navigation"
import * as React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [transcriptionState, setTranscriptionState] = React.useState({
    file_name: "",
  })
  const params = useSearchParams()
  const path = usePathname()

  React.useEffect(() => {
    if (path.includes("/transcription")) {
      const fileName = params.get("file_name")
      if (fileName)
        setTranscriptionState({
          file_name: fileName,
        })
    }
  }, [path, params])
  return (
    <>
      <AudioProvider>
        {children}
        <FloatingAudioPlayer file_name={transcriptionState.file_name} />
      </AudioProvider>
    </>
  )
}
