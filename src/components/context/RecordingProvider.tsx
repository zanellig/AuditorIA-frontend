import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Recording } from "@/lib/types.d"
import { getHost } from "@/lib/actions"

import type { UseQueryResult } from "@tanstack/react-query"

interface RecordingContextProps {
  callId?: Recording["IDLLAMADA"]
  fileName?: Recording["GRABACION"]
  setRecording: (params: {
    callId?: Recording["IDLLAMADA"]
    fileName?: Recording["GRABACION"]
  }) => void
  recordingQuery: UseQueryResult<Recording | null, unknown>
}

const RecordingContext = React.createContext<RecordingContextProps | undefined>(
  undefined
)

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = React.useState<{
    callId?: Recording["IDLLAMADA"]
    fileName?: Recording["GRABACION"]
  }>({})

  const recordingQuery = useQuery({
    queryKey: ["recording", params.callId, params.fileName],
    queryFn: () =>
      fetchRecording({ callId: params.callId, fileName: params.fileName }),
    enabled: Boolean(params.callId || params.fileName),
    staleTime: Infinity,
  })

  const setRecording = React.useCallback(
    (newParams: {
      callId?: Recording["IDLLAMADA"]
      fileName?: Recording["GRABACION"]
    }) => {
      setParams(newParams)
    },
    []
  )

  return (
    <RecordingContext.Provider
      value={{ ...params, setRecording, recordingQuery }}
    >
      {children}
    </RecordingContext.Provider>
  )
}

export function useRecordingContext() {
  const context = React.useContext(RecordingContext)
  if (!context) {
    throw new Error(
      "useRecordingContext must be used within a RecordingProvider"
    )
  }
  return context
}

async function fetchRecording({
  callId,
  fileName,
}: {
  callId?: Recording["IDLLAMADA"]
  fileName?: Recording["GRABACION"]
}): Promise<Recording | null> {
  const url = new URL(`${await getHost()}/api/recordings`)
  if (callId) url.searchParams.set("IDLLAMADA", String(callId))
  if (fileName) url.searchParams.set("GRABACION", fileName)

  // Fetch the data from the API
  const response = await fetch(url.toString())
  // Destructure the tuple from the JSON response
  const [error, recording]: [Error | null, Recording[] | null] =
    await response.json()

  // If there's an error or no recording, return null.
  if (error || !recording) {
    return null
  }
  return recording[0]
}
