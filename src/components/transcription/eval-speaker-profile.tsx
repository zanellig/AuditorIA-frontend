// @/components/transcription/eval-speaker-profile.tsx
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Task } from "@/lib/types.d"
import { cn, getHeaders } from "@/lib/utils"
import { getHost } from "@/lib/actions"
import { Loader2 } from "lucide-react"
import SpkAnalysis from "./spkanalysis"

function EvalSpeakerProfile({
  className,
  id,
}: {
  className?: string
  id: Task["identifier"]
}) {
  const [ableToFetch, setAbleToFetch] = React.useState(false)
  const {
    data: LLMAnalysis,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LLMAnalysis", id],
    queryFn: fetchLLMAnalysis,
    enabled: ableToFetch,
    retry: false,
  })

  let speakers
  if (LLMAnalysis) speakers = Object.keys(LLMAnalysis)

  async function fetchLLMAnalysis() {
    const host = await getHost()
    const response = await fetch(
      `${host}/api/task/spkanalysis?identifier=${id}`,
      {
        method: "GET",
        headers: getHeaders(host),
      }
    )
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data
  }

  return (
    <AccordionItem value='2'>
      <AccordionTrigger
        className='space-x-4'
        onClick={() => setAbleToFetch(true)}
      >
        Evaluar perfil de hablante
      </AccordionTrigger>
      <AccordionContent>
        {isLoading && (
          <div className='flex justify-center w-full'>
            <Loader2 className={cn(DASHBOARD_ICON_CLASSES, "animate-spin")} />
          </div>
        )}
        {error && (
          <code className='text-error'>{(error as Error).message}</code>
        )}
        <SpkAnalysis speakers={speakers} LLMAnalysis={LLMAnalysis} />
      </AccordionContent>
    </AccordionItem>
  )
}

export default EvalSpeakerProfile
