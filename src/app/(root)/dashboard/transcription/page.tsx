"use client"
import TranscriptionSkeleton from "@/components/skeletons/transcription-skeleton"
import TranscriptionServer from "@/components/transcription/transcription.server"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const identifier = searchParams.get("identifier")
  return (
    <Suspense fallback={<TranscriptionSkeleton />}>
      {/* @ts-ignore */}
      <TranscriptionServer taskId={identifier} />
    </Suspense>
  )
}
