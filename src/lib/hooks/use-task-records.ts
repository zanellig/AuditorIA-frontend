import * as React from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { useToast } from "@/components/ui/use-toast"
import {
  TaskRecordsSearchParams,
  TasksRecordsInternalResponse,
} from "@/lib/types"
import { fetchTasksRecords } from "@/lib/fetch-tasks"
import { useTasksRecordsStore } from "@/lib/stores/use-tasks-records-store"

export function useTasksRecords() {
  const {
    page,
    search,
    selectedFilter,
    filters,
    setPage,
    setSearch,
    setSelectedFilter,
    updateFilters,
    resetFilters,
    toggleSort,
  } = useTasksRecordsStore()

  const [debouncedSearch] = useDebounce(search, 500)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Apply search filter effects in a controlled way
  React.useEffect(() => {
    // Create a new filter object in one update to avoid multiple state changes
    const newFilters = {
      ...filters,
      [selectedFilter || "globalSearch"]: debouncedSearch,
      page: 0,
    }

    // Update filters once with the complete new state
    updateFilters(newFilters)
    setPage(0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedFilter]) // Only re-run when search or filter type changes

  const {
    isPending,
    isError,
    error,
    data,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery<TasksRecordsInternalResponse>({
    queryKey: ["tasks", "records", filters],
    queryFn: () => fetchTasksRecords(filters),
    enabled: true,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    if (isError) {
      toast({ title: "Error al cargar los datos", variant: "destructive" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  const setNextPage = () => {
    if (data?.success && data?.hasMore) {
      setPage(page + 1)
    }
  }

  const setPreviousPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const setLastPage = () => {
    if (!data?.success) return
    const lastPage = data?.pages - 1
    setPage(lastPage)
  }

  const setFirstPage = () => {
    setPage(0)
  }

  return {
    data,
    page,
    isPending,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    filters,
    selectedFilter,
    search,
    setSearch,
    setSelectedFilter,
    setPage,
    updateFilters,
    fetchWithNewFilters: updateFilters,
    refetch,
    resetFilters,
    setNextPage,
    setPreviousPage,
    setLastPage,
    setFirstPage,
    toggleSort,
  }
}
