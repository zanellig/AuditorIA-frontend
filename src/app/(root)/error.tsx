"use client"
import ErrorScreen from "@/components/error/error-screen"
import * as React from "react"
import * as Sentry from "@sentry/nextjs"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])
  return <ErrorScreen error={error} reset={reset} />
}
