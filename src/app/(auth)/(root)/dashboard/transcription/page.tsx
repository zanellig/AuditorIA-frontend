"use client"

import { useSearchParams } from "next/navigation"
import TranscriptionClient from "@/components/transcription/transcription.client"

export default function Page() {
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier")

  if (identifier) return <TranscriptionClient taskId={identifier} />

  return (
    <TranscriptionClient
      drawerOptions={{
        show: true,
        text: "No se ha proporcionado un ID de tarea.",
      }}
    />
  )
}
