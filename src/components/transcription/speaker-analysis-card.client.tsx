"use client"
import React, { useEffect, useState } from "react"
import { cn, getUniqueWords } from "@/lib/utils"
import { Button } from "../ui/button"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  Cross2Icon,
  Pencil2Icon,
  PlayIcon,
} from "@radix-ui/react-icons"
import { Analysis, Segment } from "@/lib/types"
import { usePathname, useSearchParams } from "next/navigation"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getSpeakerProfileLLM } from "@/lib/actions"
import { Input } from "../ui/input"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { useToast } from "../ui/use-toast"

export default function SpeakerAnalysisCard({
  children,
  className,
  segments,
}: {
  children: React.ReactNode
  className?: string
  segments: Segment[]
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [LLMAnalysis, setLLMAnalysis] = useState<any | null>(null)
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
        <div id='analysis-content'>
          <Accordion type='single' collapsible className='lg:w-[500px]'>
            <LocalWordSearch words={uniqueWords} />
            <AccordionItem value='2'>
              <AccordionTrigger
                className='space-x-4'
                // onClick={() => {
                //   getSpeakerProfileLLM(id).then(data => {
                //     console.log(`data: `, data)
                //     setLLMAnalysis(data)
                //   })
                // }}
              >
                <span>Evaluar perfil de hablante</span>
              </AccordionTrigger>
              <AccordionContent>
                <span>2</span>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
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
  const [inputs, setInputs] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState<string>("")
  type EditingState = [boolean, string, number]
  const [edit, setEdit] = useState<EditingState>([false, "", -1])

  function searchWords(
    searchWords: string[],
    targetWords: Set<string>
  ): boolean[] {
    return [...searchWords].map(searchWord => {
      return targetWords.has(searchWord)
    })
  }

  return (
    <AccordionItem value='1'>
      <AccordionTrigger>Buscar palabras</AccordionTrigger>
      <AccordionContent className='flex flex-col space-y-2'>
        <div className='flex flex-row space-x-2 items-center'>
          <Input
            className='focus-visible:ring-0'
            placeholder='Ingrese una palabra'
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
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
                  title: "Ingrese una palabra para buscar",
                  variant: "destructive",
                })
                return
              }
              setInputs([...inputs, currentInput])
              setCurrentInput("")
            }}
          >
            <CheckIcon className={DASHBOARD_ICON_CLASSES} />
          </Button>
        </div>
        {inputs.map((input, i) => {
          return (
            <div
              key={`word-container-${i}`}
              className='flex flex-row items-center space-x-2'
            >
              <Button
                key={`word-remove-${i}`}
                variant='outline'
                onClick={() =>
                  setInputs(inputs.filter((_, index) => index !== i))
                }
              >
                <Cross2Icon className={DASHBOARD_ICON_CLASSES} />
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  if (edit[0] && edit[2] === i) {
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
                  <CheckIcon className={DASHBOARD_ICON_CLASSES} />
                ) : (
                  <Pencil2Icon className={DASHBOARD_ICON_CLASSES} />
                )}
              </Button>
              {edit[0] && edit[2] === i ? (
                <Input
                  value={edit[1]}
                  onChange={e => setEdit([true, e.target.value, edit[2]])}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      setInputs(
                        inputs.map((_, i) => {
                          if (i === edit[2]) {
                            return edit[1]
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
          )
        })}
        {inputs.length > 0 && (
          <Button
            className='flex flex-row items-center space-x-2'
            onClick={() => {
              // forward the click event to the close-speaker-analysis-card-button
              const closeButton = document.getElementById(
                "close-speaker-analysis-card-button"
              )
              if (closeButton) {
                closeButton.click()
              }
            }}
          >
            <ArrowRightIcon className={DASHBOARD_ICON_CLASSES} />
            <span>Buscar</span>
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
