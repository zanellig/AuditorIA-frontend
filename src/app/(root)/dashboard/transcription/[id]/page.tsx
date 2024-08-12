import TranscriptionSkeleton from "@/components/skeletons/transcription-skeleton"
import TranscriptionServer from "@/components/transcription/transcription.server"
import { Suspense } from "react"

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<TranscriptionSkeleton />}>
      <TranscriptionServer taskId={params.id} />
    </Suspense>
  )
}

/**
 * TODO: SIN USAR HASTA QUE SE LEVANTE LA API
 */
