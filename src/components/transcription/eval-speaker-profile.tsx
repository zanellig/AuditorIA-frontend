// @/components/transcription/eval-speaker-profile.tsx
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getHost } from "@/lib/actions"
import { Loader2, Sparkles } from "lucide-react"
import SpkAnalysis from "./spkanalysis"

function EvalSpeakerProfile({
  className,
  id,
  setFetchStatus,
}: {
  className?: string
  id: Task["identifier"]
  setFetchStatus?: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [ableToFetch, setAbleToFetch] = React.useState(false)
  const {
    data: LLMAnalysis,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LLMAnalysis", id],
    queryFn: fetchLLMAnalysis,
    enabled: !!id && ableToFetch,
    retry: false,
  })

  let speakers
  if (LLMAnalysis) speakers = Object.keys(LLMAnalysis)

  async function fetchLLMAnalysis() {
    return await fetch(
      `${await getHost()}/api/task/spkanalysis?identifier=${id}`
    ).then(async res => {
      if (!res.ok)
        throw new Error("Error al obtener el análisis de los hablantes")
      return await res.json()
    })
  }

  return (
    <AccordionItem value='2'>
      <AccordionTrigger onClick={() => setAbleToFetch(true)}>
        <span className='flex gap-2 justify-start items-center'>
          <span>Evaluar perfil de hablante</span>
          <Sparkles size={GLOBAL_ICON_SIZE} className='animate-sparkle' />
        </span>
      </AccordionTrigger>
      <AccordionContent className={cn(className)}>
        {isLoading && (
          <div className='flex justify-center w-full'>
            <Loader2 className={cn(DASHBOARD_ICON_CLASSES, "animate-spin")} />
          </div>
        )}
        {error && (
          <code className='text-error'>{(error as Error).message}</code>
        )}
        {LLMAnalysis && (
          <SpkAnalysis speakers={speakers} LLMAnalysis={LLMAnalysis} />
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

export default EvalSpeakerProfile
