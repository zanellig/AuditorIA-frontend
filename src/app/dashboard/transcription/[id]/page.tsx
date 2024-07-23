import TranscriptionServer from "@/components/transcription/transcription.server"

export default function Page({ params }: { params: { id: string } }) {
  return <TranscriptionServer taskId={params.id} />
}

/**
 * TODO: SIN USAR HASTA QUE SE LEVANTE LA API
 */
