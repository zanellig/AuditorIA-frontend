import { Suspense } from "react"
import TranscriptionWrapper from "@/components/TranscriptionWrapper"
import TranscriptionSkeleton from "@/components/skeletons/transcription-skeleton"

export default function Page() {
  return (
    <Suspense fallback={<TranscriptionSkeleton />}>
      <TranscriptionWrapper />
    </Suspense>
  )
}
