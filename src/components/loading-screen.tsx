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
      <div className='h-[500px] bg-background flex flex-col items-center justify-center text-center'>
        <div className='relative w-full h-full rounded-3xl overflow-hidden my-auto'>
          {/* Core component */}
          <SparklesCore
            id='tsparticles-loading'
            background='transparent'
            minSize={0.4}
            maxSize={2.5}
            particleDensity={30}
            particleColor={particleColor}
            className='w-full h-full'
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className='absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(500px_500px_at_top,transparent_5%,white)]'></div>
        </div>
        <div className='text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 absolute z-10 bg-opacity-5 bg-background'>
          Obteniendo
          <FlipWords words={words} /> <br />
          con Inteligencia Artificial...
        </div>
      </div>
    </>
  )
}
