import React, { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { ClipboardCopyIcon } from "@radix-ui/react-icons"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { useToast } from "../ui/use-toast"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Task } from "@/lib/types.d"
import { handleCopyToClipboard } from "@/lib/utils"
import { getOperatorQuality } from "@/lib/actions"

function EvalSpeakerProfile({
  className,
  id,
}: {
  className?: string
  id: Task["identifier"]
}) {
  const { toast } = useToast()
  const [storedResponse, setStoredResponse] = useState<string | null>(null)

  useEffect(() => {
    // Load stored data from localStorage when the component mounts
    const storedString = localStorage.getItem("response")
    if (storedString) {
      setStoredResponse(storedString)
    }
  }, [])

  const fetchLLMAnalysis = async () => {
    let response
    if (!storedResponse) {
      response = await fetch(
        `http://10.20.30.211:3030/api/task/spkanalysis?identifier=${id}`,
        {
          method: "GET",
        }
      )
      const data = await response.json()
      if (data[0] !== null) {
        throw new Error(data[0].detail)
      }
      const str = data[1].processed_result.match(/json\s+([\s\S]*?)\s+/)[1]
      localStorage.setItem("response", str)
      return JSON.parse(str)
    }
    return storedResponse
  }

  const {
    data: LLMAnalysis,
    error: fetchError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["LLMAnalysis", id],
    queryFn: fetchLLMAnalysis,
    enabled: false, // This ensures the query doesn't run automatically
    retry: false,
  })

  const {
    data: operatorQuality,
    isLoading: isOperatorQualityLoading,
    error: operatorQualityError,
    refetch: refetchOperatorQuality,
  } = useQuery({
    queryKey: ["operatorQuality", id],
    queryFn: () => getOperatorQuality(id),
    enabled: false, // This ensures the query doesn't run automatically
    retry: false,
  })

  return (
    <AccordionItem value='2'>
      <AccordionTrigger className='space-x-4'>
        <span>Evaluar perfil de hablante</span>
      </AccordionTrigger>
      <AccordionContent>
        {isFetching && <div>Loading...</div>}
        {fetchError && <code>{(fetchError as Error).message}</code>}
        {(LLMAnalysis || storedResponse) &&
          Object.entries(LLMAnalysis || JSON.parse(storedResponse!)).map(
            ([key, value], i) => (
              <div key={i} className='flex flex-col gap-2'>
                <div className='flex flex-row items-center space-x-2'>
                  <span className='text-sm'>{key}</span>
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleCopyToClipboard(JSON.stringify(value))
                      toast({
                        title: "Texto copiado al portapapeles",
                        variant: "success",
                      })
                    }}
                  >
                    <ClipboardCopyIcon className={DASHBOARD_ICON_CLASSES} />
                  </Button>
                </div>
                <code className='whitespace-pre-wrap'>
                  {JSON.stringify(value, null, 2)}
                </code>
              </div>
            )
          )}
      </AccordionContent>
    </AccordionItem>
  )
}

export default EvalSpeakerProfile

/*

function EvalSpeakerProfile({
  className,
  id,
}: {
  className?: string
  id: Task["identifier"]
}) {
  const { toast } = useToast()

  const [LLMAnalysis, setLLMAnalysis] = useState<any | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<any>(null)
  const [storedResponse, setStoredResponse] = useState<string | null>(null)

  React.useEffect(() => {
    // Load stored data from localStorage when the component mounts
    const storedString = localStorage.getItem("response")
    if (storedString) {
      setLLMAnalysis(JSON.parse(storedString))
      setStoredResponse(storedString)
    }
  }, [])

  React.useEffect(() => {
    if (storedResponse !== null) {
      return
    }
    const fetchData = async () => {
      const [err, res] = await fetch(`/api/task/spkanalysis?identifier=${id}`, {
        method: "GET",
      }).then(async res => await res.json())
      if (err !== null) {
        setFetchError(err["detail"])
        return
      }
      const str = res["processed_result"].match(/```json\s+([\s\S]*?)\s+```/)[1]
      localStorage.setItem("response", str)
      setLLMAnalysis(JSON.parse(str))
      setIsFetching(false)
    }
    fetchData()
  }, [isFetching])

  return (
    <>
      <AccordionItem value='2'>
        <AccordionTrigger
          className='space-x-4'
          onClick={() => {
            setIsFetching(true)
          }}
        >
          <span>Evaluar perfil de hablante</span>
        </AccordionTrigger>
        <AccordionContent>
          {LLMAnalysis &&
            Object.keys(LLMAnalysis).map((key, i) => {
              return (
                <div key={i} className='flex flex-col gap-2'>
                  <div className='flex flex-row items-center space-x-2'>
                    <span className='text-sm'>{key}</span>
                    <Button
                      variant='outline'
                      onClick={() => {
                        handleCopyToClipboard(JSON.stringify(LLMAnalysis[key]))
                        toast({
                          title: "Texto copiado al portapapeles",
                          variant: "success",
                        })
                      }}
                    >
                      <ClipboardCopyIcon className={DASHBOARD_ICON_CLASSES} />
                    </Button>
                  </div>
                  <code className='whitespace-pre-wrap'>
                    {LLMAnalysis[key]}
                  </code>
                </div>
              )
            })}
          {fetchError && <code>{fetchError}</code>}
        </AccordionContent>
      </AccordionItem>
    </>
  )
}*/
