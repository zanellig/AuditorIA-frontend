import { QueryKey, useQuery } from "@tanstack/react-query"
import { Task } from "@/lib/types"
import { getHost } from "@/lib/actions"

// Define the filter parameters type
type TaskFilters = Partial<{
  status: Task["status"]
  taskType: Task["task_type"]
  language: Task["language"]
  fileName: Task["file_name"]
}>

interface UseTasksOptions {
  filters?: TaskFilters
  queryKey?: QueryKey
}

export function useTasks({
  filters = {},
  queryKey = [],
}: UseTasksOptions = {}) {
  queryKey ??= [
    "tasks",
    filters?.status,
    filters?.taskType,
    filters?.language,
    filters?.fileName,
  ] as const

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with search params
      const url = new URL(`${await getHost()}/api/tasks`)

      // Add filters as search params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })

      const response = await fetch(url)
      const [error, tasks] = (await response.json()) as [
        string | null,
        Task[] | null,
      ]

      if (error) {
        throw new Error(error)
      }

      return tasks || []
    },
    // Additional configuration options
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
