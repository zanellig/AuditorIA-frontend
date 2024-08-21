"use client"

import { useSearchParams } from "next/navigation"
import TranscriptionClient from "@/components/transcription/transcription.client"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales } from "@/lib/types.d"

export default function Page() {
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier")
  if (identifier) return <TranscriptionClient taskId={identifier} />

  return (
    <ErrorCodeUserFriendly
      error={
        new Error("400: Task ID not provided", {
          cause: "The task ID was not provided in the URL",
        })
      }
      locale={SupportedLocales.ES}
    />
  )
}
