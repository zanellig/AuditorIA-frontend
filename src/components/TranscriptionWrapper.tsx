"use client"

import { useSearchParams } from "next/navigation"
import {
  TranscriptionClient,
  TranscriptionNotReady,
} from "@/components/transcription/transcription.client"

export default function TranscriptionWrapper() {
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier")

  if (identifier && identifier !== "" && identifier !== "null") {
    return <TranscriptionClient taskId={identifier} />
  }
  return (
    <TranscriptionNotReady text={"No se ha proporcionado un ID de tarea."} />
  )
}
