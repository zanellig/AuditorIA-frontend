"use client"
import ErrorScreen from "@/components/error/error-screen"
import * as React from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorScreen error={error} reset={reset} />
}
