"use client"
import { FlipWords } from "@/components/ui/flip-words"
import { SparklesCore } from "@/components/ui/sparkles-core"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import React from "react"

export default function LoadingScreen({
  className,
  words,
  usingAI = false,
}: {
  className?: string
  words?: string[]
  usingAI?: boolean
}) {
  const { theme } = useTheme()
  const initialWords = React.useMemo(
    () => ["transcripción", "sentimiento", "emociones", "análisis"],
    []
  )

  const [displayWords, setDisplayWords] = React.useState<string[]>([])

  React.useEffect(() => {
    if (words && words.length > 0) {
      setDisplayWords([...words].sort(() => Math.random() - 0.5))
    } else {
      setDisplayWords([...initialWords].sort(() => Math.random() - 0.5))
    }
  }, [words, initialWords])

  const particleColor = theme === "dark" ? "#FFFFFF" : "#000000"

  return (
    <>
      <div
        className={cn(
          "h-[500px] flex flex-col items-center justify-center text-center",
          className
        )}
      >
        <div className='relative w-full h-full rounded-3xl overflow-hidden my-auto'>
          {/* Core component */}
          <SparklesCore
            id='tsparticles-loading'
            background='transparent'
            minSize={0.4}
            maxSize={3.5}
            particleDensity={20}
            particleColor={particleColor}
            className='w-full h-full'
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className='absolute inset-0 w-full h-full bg-transparent overflow-hidden [mask-image:radial-gradient(500px_500px_at_top,transparent_5%,white)]'></div>
        </div>
        <div
          className='text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 absolute z-10 bg-transparent'
          style={{ userSelect: "none" }}
        >
          Obteniendo
          <FlipWords words={displayWords} /> <br />
          {usingAI && "con Inteligencia Artificial..."}
        </div>
      </div>
    </>
  )
}
