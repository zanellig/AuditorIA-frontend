"use client"

import ErrorScreen from "@/components/error/error-screen"
import * as Sentry from "@sentry/nextjs"
import * as React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorScreen error={error} reset={reset} />
      </body>
    </html>
  )
}
