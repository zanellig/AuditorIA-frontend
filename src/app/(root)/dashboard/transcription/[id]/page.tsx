import TranscriptionSkeleton from "@/components/skeletons/transcription-skeleton"
import TranscriptionServer from "@/components/transcription/transcription.server"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Suspense } from "react"

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ScrollArea className='max-h-dvh h-dvh pt-16'>
      <Suspense fallback={<TranscriptionSkeleton />}>
        <TranscriptionServer taskId={params.id} />
      </Suspense>
    </ScrollArea>
  )
}

/**
 * TODO: SIN USAR HASTA QUE SE LEVANTE LA API
 */
