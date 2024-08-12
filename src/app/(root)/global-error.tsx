"use client"
import "globals.css"
import ErrorScreen from "@/components/error/error-screen"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/ThemeProvider"

const inter = Inter({ subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang='es'>
      <body className={inter.className}>
        <ThemeProvider>
          <div className='flex flex-col items-start justify-start max-w-2xl my-auto mx-auto pt-16'>
            <ErrorScreen error={error} reset={reset} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
