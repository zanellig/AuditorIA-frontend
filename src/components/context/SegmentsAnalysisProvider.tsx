import { getHost } from "@/lib/actions"
import { SegmentAnalysis } from "@/lib/types"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { createContext, useContext, useState, ReactNode } from "react"

interface ISegmentsAnalysisContextValue {
  segmentsAnalysis: SegmentAnalysis[]
  query: UseQueryResult<SegmentAnalysis[]>
  setTaskId: ({ taskId }: { taskId: string }) => void
}

const SegmentsAnalysisContext = createContext<
  ISegmentsAnalysisContextValue | undefined
>(undefined)

export const useSegmentsAnalysis = () => {
  const context = useContext(SegmentsAnalysisContext)
  if (!context)
    throw new Error(
      "useSegmentsAnalysis must be used within a SegmentsAnalysisProvider"
    )
  return context
}

const fetchSegmentsAnalysis = async (taskId: string) => {
  const data: SegmentAnalysis[] = await fetch(
    `http://10.20.30.108:8000/task/get_analisis/${taskId}`
  ).then(async res => await res.json())

  return data
}

export const SegmentsAnalysisProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [taskIdState, setTaskIdState] = useState<string | null>(null)
  const segmentsAnalysisQuery = useQuery({
    queryKey: ["segmentsAnalysis", taskIdState],
    queryFn: async () => {
      if (!taskIdState) return []
      return await fetchSegmentsAnalysis(taskIdState)
    },
    staleTime: 30 * 1000,
    enabled: !!taskIdState,
  })

  const setTaskId = ({ taskId }: { taskId: string }) => {
    setTaskIdState(taskId)
  }

  const value = {
    segmentsAnalysis: segmentsAnalysisQuery.data ?? [],
    query: segmentsAnalysisQuery,
    setTaskId,
  }

  return (
    <SegmentsAnalysisContext.Provider value={value}>
      {children}
    </SegmentsAnalysisContext.Provider>
  )
}
