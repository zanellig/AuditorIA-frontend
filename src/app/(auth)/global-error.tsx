"use client"
import "globals.css"
import ErrorScreen from "@/components/error/error-screen"

import { ThemeProvider } from "@/components/context/ThemeProvider"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='justify-center items-center flex h-dvh w-dvw'>
      <ThemeProvider>
        <div className='flex flex-col items-start justify-start max-w-2xl my-auto mx-auto pt-16'>
          <ErrorScreen error={error} reset={reset} />
        </div>
      </ThemeProvider>
    </div>
  )
}
