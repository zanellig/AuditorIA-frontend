"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ChevronLeftIcon, PlayIcon } from "@radix-ui/react-icons"
import { Analysis } from "@/lib/types"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()
  const id = pathname.split("/").at(-1)

  return (
    <div
      className={cn(
        "fixed right-4 rounded-md border backdrop-blur-sm w-fit h-fit py-4 px-2 transition-transform duration-400 z-10",
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
          <Button
            variant='outline'
            className='w-full'
            onClick={() => {
              // @ts-ignore
              const analysisSv = getAnalysisSv(id)
              setAnalysis(analysisSv)
              console.log(`analysisFromServer: ${analysisSv}`)
            }}
          >
            Ver análisis por hablante
          </Button>
          {analysis && <div className='bg-success'>Good!</div>}
        </div>
      </div>
    </div>
  )
}
