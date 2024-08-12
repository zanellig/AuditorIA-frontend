"use client"
import ErrorScreen from "@/components/error/error-screen"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='flex flex-col items-start justify-start max-w-2xl my-auto mx-auto pt-16'>
      <ErrorScreen error={error} reset={reset} />
    </div>
  )
}
