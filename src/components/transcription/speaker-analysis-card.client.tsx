// @/components/transcription/speaker-analysis-card.client.tsx
"use client"
import React from "react"
import { cn, getUniqueWords, normalizeString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react"
import { FoundWordsState, Segment, Task } from "@/lib/types"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useToast } from "@/components/ui/use-toast"
import {
  LoadingState,
  MultiStepLoader,
} from "@/components/ui/multi-step-loader"
import EvalSpeakerProfile from "@/components/transcription/eval-speaker-profile"
import OperatorQualityAccordionWrapper from "@/components/transcription/operator-quality/operator-quality-accordion-wrapper"
import { ScrollArea } from "@/components/ui/scroll-area"
import MetadataDisplay from "@/components/transcription/metadata-display"
import { useTranscription } from "@/components/context/TranscriptionProvider"
import AIChatInterface from "../ai-chat"

/**
 * ### Here we get the operator_quality and spkanalysis.
 */
export default function SpeakerAnalysisCard({
  className,
  segments,
}: {
  children?: React.ReactNode
  className?: string
  segments: Segment[]
}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const searchParams = useSearchParams()
  const id = searchParams.get("identifier")
  const uniqueWords = getUniqueWords(segments || [])
  const { transcription } = useTranscription()

  return (
    <>
      <Button
        variant={"outline"}
        className={cn(
          "p-2 rounded-full space-x-2 flex transition-all duration-300 fixed right-2 z-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
        id='close-speaker-analysis-card-button'
      >
        <ChevronLeft
          className={cn(
            "w-[1.2rem] h-[1.2rem] transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
        <span>{isOpen ? "Ocultar" : "Mostrar"} dashboard de auditoría</span>
      </Button>
      <div
        className={cn(
          "shadow-lg border bg-popover rounded-md fixed right-0 flex px-2 transition-transform duration-400 z-10 top-[104px] h-[calc(100dvh-104px)]",
          className,
          isOpen ? "-translate-x-2" : "translate-x-full"
        )}
      >
        <ScrollArea>
          <div className='flex flex-col gap-4 items-center justify-between space-x-4 h-[800px] lg:min-w-[500px] p-4 w-full'>
            <Accordion type='multiple' className='w-full'>
              <AccordionItem value='1'>
                <AccordionTrigger>Buscar palabras</AccordionTrigger>
                <AccordionContent className='flex flex-col space-y-2'>
                  <LocalWordSearch words={uniqueWords} />
                </AccordionContent>
              </AccordionItem>
              <EvalSpeakerProfile
                id={id as Task["identifier"]}
                className='lg:max-w-[650px]'
              />
              <OperatorQualityAccordionWrapper id={id as Task["identifier"]} />
              <AccordionItem value='5'>
                <AccordionTrigger>Información avanzada</AccordionTrigger>
                <AccordionContent className='flex flex-col gap-2'>
                  <MetadataDisplay metadata={transcription?.metadata} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <AIChatInterface />
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

function LocalWordSearch({
  words,
}: {
  className?: string
  words: Set<string>
}) {
  const { toast } = useToast()
  const [inputs, setInputs] = React.useState<string[]>([])
  const [currentInput, setCurrentInput] = React.useState<string>("")
  type EditingState = [boolean, string, number]
  const [edit, setEdit] = React.useState<EditingState>([false, "", -1])
  // this is only while we figure out how to change the component to accept the FoundWordsState[] as a prop
  const [loadingStates, setLoadingStates] = React.useState<LoadingState[]>([])
  const [searchingWordsForUser, setSearchingWordsForUser] =
    React.useState<boolean>(false)
  const [timer, setTimer] = React.useState<number>(0)
  const [foundWords, setFoundWords] = React.useState<FoundWordsState[]>([])
  function searchWords(
    searchWords: string[],
    targetWords: Set<string>
  ): FoundWordsState[] {
    return [...searchWords].map((searchWord, i) => {
      const hasTargetWord = targetWords.has(searchWord.toLowerCase())
      return [hasTargetWord, searchWord, i]
    })
  }
  // Create refs for each input
  const inputRefs = React.useRef<HTMLInputElement[] | null[]>([])

  React.useEffect(() => {
    // timer
    if (searchingWordsForUser) {
      const loadingTimer = setTimeout(() => {
        setSearchingWordsForUser(false)
        _reset()
        setLoadingStates([])
        setTimer(0)
      }, timer)
      return () => clearTimeout(loadingTimer)
    }
  }, [searchingWordsForUser, timer])

  // Focus input when editing starts
  React.useEffect(() => {
    if (edit[0] && inputRefs.current[edit[2]]) {
      inputRefs.current[edit[2]]?.focus()
    }
  }, [edit])

  function _reset() {
    setCurrentInput("")
    setInputs([])
  }

  return (
    <>
      {searchingWordsForUser && (
        <MultiStepLoader
          loadingStates={loadingStates}
          loading={true}
          duration={timer}
          loop={true}
          targetWords={foundWords}
        />
      )}

      <div className='flex flex-row space-x-2 items-center'>
        <Input
          className='focus-visible:ring-0'
          placeholder='Ingrese una palabra'
          value={currentInput}
          onChange={e => setCurrentInput(normalizeString(e.target.value))}
          onKeyDown={e => {
            if (e.key === "Enter") {
              if (currentInput === "") {
                toast({
                  title: "Ingrese una palabra a buscar",
                  variant: "destructive",
                })
                return
              }
              setInputs([...inputs, currentInput])
              setCurrentInput("")
            }
          }}
        />
        <Button
          variant={"outline"}
          onClick={() => {
            if (currentInput === "") {
              toast({
                title: "Ingrese una palabra a buscar",
                variant: "destructive",
              })
              return
            }
            setInputs([...inputs, currentInput])
            setCurrentInput("")
          }}
        >
          <Check
            className={cn(
              DASHBOARD_ICON_CLASSES,
              currentInput && "text-foreground"
            )}
          />
        </Button>
      </div>
      {inputs.map((input, i) => {
        return (
          <div className='flex flex-col gap-2' key={input + "-" + i}>
            {edit[0] && edit[2] === i && (
              <span className='text-sm text-muted-foreground'>
                Para salir del modo edición presione{" "}
                <code className='text-foreground'>Esc</code>. <br /> Para
                confirmar la edición presione{" "}
                <code className='text-foreground'>Enter</code>.
              </span>
            )}
            <div
              key={`word-container-${i}`}
              className='flex flex-row items-center space-x-2'
            >
              <Button
                key={`word-remove-${i}`}
                variant='outline'
                onClick={() => {
                  setInputs(inputs.filter((_, index) => index !== i))
                  setEdit([false, "", -1])
                }}
              >
                <Trash2
                  className={cn(DASHBOARD_ICON_CLASSES, "text-foreground")}
                />
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  if (edit[0] && edit[2] === i) {
                    // Check if edit[1] (input value) is not empty
                    if (edit[1].trim() === "") {
                      toast({
                        title: "La palabra no puede estar vacía",
                        variant: "destructive",
                      })
                      return
                    }
                    // change the value of the input[i] to the new value
                    setInputs(
                      inputs.map((_, i) => {
                        if (i === edit[2]) {
                          return edit[1]
                        }
                        return _
                      })
                    )
                    setEdit([false, "", -1])
                    return
                  }
                  setEdit([true, input, i])
                }}
              >
                {edit[0] && edit[2] === i ? (
                  <Check
                    className={cn(DASHBOARD_ICON_CLASSES, "text-foreground")}
                  />
                ) : (
                  <Pencil
                    className={cn(DASHBOARD_ICON_CLASSES, "text-foreground")}
                  />
                )}
              </Button>
              {edit[0] && edit[2] === i ? (
                <Input
                  ref={el => {
                    inputRefs.current[i] = el
                  }}
                  value={normalizeString(edit[1])}
                  onChange={e => setEdit([true, e.target.value, edit[2]])}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (edit[1].trim() === "") {
                        toast({
                          title: "La palabra no puede estar vacía",
                          variant: "destructive",
                        })
                        return
                      }
                      setInputs(
                        inputs.map((_, i) => {
                          if (i === edit[2]) {
                            return normalizeString(edit[1])
                          }
                          return _
                        })
                      )
                      setEdit([false, "", -1])
                    }
                    if (e.key === "Escape") {
                      setEdit([false, "", -1])
                    }
                  }}
                />
              ) : (
                <div
                  className='rounded-md bg-popover p-2 text-sm border border-input w-full'
                  style={{
                    userSelect: "none",
                  }}
                >
                  {input}
                </div>
              )}
            </div>
          </div>
        )
      })}
      {inputs.length > 0 && (
        <Button
          className='flex flex-row items-center space-x-2'
          onClick={() => {
            setFoundWords(searchWords(inputs, words))
            for (const input of inputs) {
              setTimer(prevTimer => prevTimer + 600)
              const loadingState: LoadingState = {
                text: input,
              }
              setLoadingStates(prev => [...prev, loadingState])
            }
            setEdit([false, "", -1])
            setSearchingWordsForUser(true)
            _reset()
          }}
        >
          <ArrowRight className={DASHBOARD_ICON_CLASSES} />
          <span>Buscar</span>
        </Button>
      )}
    </>
  )
}
