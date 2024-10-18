// @/components/transcription/speaker-analysis-card.client.tsx
"use client"
import React from "react"
import {
  _replaceSpecialCharacters,
  cn,
  getUniqueWords,
  normalizeString,
} from "@/lib/utils"
import { Button } from "../ui/button"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons"
import { FoundWordsState, Segment, Task } from "@/lib/types.d"
import { useSearchParams } from "next/navigation"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "../ui/input"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { useToast } from "../ui/use-toast"
import { LoadingState, MultiStepLoader } from "../ui/multi-step-loader"
import EvalSpeakerProfile from "./eval-speaker-profile"
import { Trash2 } from "lucide-react"
import OperatorQualityAccordionWrapper from "./operator-quality/operator-quality-accordion-wrapper"
import { ScrollArea } from "../ui/scroll-area"

export default function SpeakerAnalysisCard({
  children,
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

  return (
    <div
      className={cn(
        "fixed right-4 rounded-md border bg-popover w-fit h-fit py-4 px-2 transition-transform duration-400 z-10 shadow-lg",
        className,
        isOpen ? "" : "translate-x-[94%]"
      )}
    >
      <div className='flex flex-row items-center justify-between space-x-4'>
        <Button
          variant={"ghost"}
          className='p-2 rounded-full'
          onClick={() => setIsOpen(!isOpen)}
          id='close-speaker-analysis-card-button'
        >
          <ChevronLeftIcon
            className={cn(
              "w-[1.2rem] h-[1.2rem] transition-transform duration-300",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </Button>
        <ScrollArea className='lg:max-h-[500px] lg:min-w-[500px]'>
          <Accordion type='multiple'>
            <LocalWordSearch words={uniqueWords} />
            <EvalSpeakerProfile
              id={id as Task["identifier"]}
              className='lg:max-w-[650px]'
            />
            <OperatorQualityAccordionWrapper id={id as Task["identifier"]} />
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  )
}

function LocalWordSearch({
  className,
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
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

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
  }, [searchingWordsForUser])

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
      <AccordionItem value='1'>
        <AccordionTrigger>Buscar palabras</AccordionTrigger>
        <AccordionContent className='flex flex-col space-y-2'>
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
              <CheckIcon
                className={cn(
                  DASHBOARD_ICON_CLASSES,
                  currentInput && "text-foreground"
                )}
              />
            </Button>
          </div>
          {inputs.map((input, i) => {
            return (
              <div className='flex flex-col gap-2'>
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
                      <CheckIcon
                        className={cn(
                          DASHBOARD_ICON_CLASSES,
                          "text-foreground"
                        )}
                      />
                    ) : (
                      <Pencil2Icon
                        className={cn(
                          DASHBOARD_ICON_CLASSES,
                          "text-foreground"
                        )}
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
              <ArrowRightIcon className={DASHBOARD_ICON_CLASSES} />
              <span>Buscar</span>
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </>
  )
}
