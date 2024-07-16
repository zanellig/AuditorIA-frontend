"use client"
import { FlipWords } from "@/components/ui/flip-words"
import { SparklesCore } from "@/components/ui/sparkles-core"
import { useTheme } from "next-themes"

export default function LoadingScreen() {
  const { theme } = useTheme()
  const initialWords = ["transcripción", "sentimiento", "emociones", "análisis"]
  const words = [...initialWords].sort(() => Math.random() - 0.5)

  const particleColor = theme === "dark" ? "#FFFFFF" : "#000000"

  return (
    <>
      <div className='h-[40rem] w-full bg-background flex flex-col items-center justify-center overflow-hidden rounded-md text-center'>
        <div className='text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 '>
          Obteniendo
          <FlipWords words={words} /> <br />
          con Inteligencia Artificial...
        </div>
        <div className='w-[80rem] h-96 absolute'>
          {/* <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm' />
          <div className='absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4' />
          <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm' />
          <div className='absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4' /> */}

          {/* Core component */}
          <SparklesCore
            background='transparent'
            minSize={0.4}
            maxSize={2}
            particleDensity={30}
            className='w-full h-full'
            particleColor={particleColor}
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className='absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(500px_500px_at_top,transparent_5%,white)]'></div>
        </div>
      </div>
    </>
  )
}
