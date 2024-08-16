"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ChevronLeftIcon, PlayIcon } from "@radix-ui/react-icons"
import { Analysis } from "@/lib/types"
import { usePathname, useSearchParams } from "next/navigation"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getSpeakerProfileLLM } from "@/lib/actions"

export default function SpeakerAnalysisCard({
  children,
  className,
  getAnalysisSv,
}: {
  children: React.ReactNode
  className?: string
  getAnalysisSv: (id: string) => Promise<boolean>
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [LLMAnalysis, setLLMAnalysis] = useState<any | null>(null)
  const searchParams = useSearchParams()
  const id = searchParams.get("identifier")

  return (
    <div
      className={cn(
        "fixed right-4 rounded-md border bg-popover w-fit h-fit py-4 px-2 transition-transform duration-400 z-10",
        className,
        isOpen ? "" : "translate-x-[85%]"
      )}
    >
      <div className='flex flex-row items-center justify-between space-x-4'>
        <Button
          variant={"ghost"}
          className='p-2 rounded-full'
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronLeftIcon
            className={cn(
              "w-[1.2rem] h-[1.2rem] transition-transform duration-300",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </Button>
        <div id='analysis-content'>
          <Accordion type='single' collapsible>
            <AccordionItem value='1'>
              <AccordionTrigger>Palabras</AccordionTrigger>
              <AccordionContent>
                <span>1</span>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='2'>
              <AccordionTrigger
                className='space-x-4'
                onClick={() => {
                  getSpeakerProfileLLM(id).then(data => {
                    console.log(`data: `, data)
                    setLLMAnalysis(data)
                  })
                }}
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
