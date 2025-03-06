"use client"

import ErrorScreen from "@/components/error/error-screen"
import * as React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorScreen error={error} reset={reset} />
      </body>
    </html>
  )
}
