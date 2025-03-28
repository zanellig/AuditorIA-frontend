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
    // Cancel any in-flight queries
    queryClient.cancelQueries({ queryKey: ["tasks", "records", filters] })

    // Remove previous queries to free up resources
    queryClient.removeQueries({ queryKey: ["tasks", "records", filters] })

    updateFilters({
      uuid: null,
      file_name: null,
      status: null,
      user: null,
      campaign: null,
      [selectedFilter || "globalSearch"]: debouncedSearch,
      page: 0,
    })
    setPage(0)

    if (isError) {
      toast({ title: "Error al cargar los datos", variant: "destructive" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]) // DON'T MODIFY. This is a dependency that triggers the query to refetch when the search input changes

  React.useEffect(() => {
    if (!data?.success) return
    // Pages are 0 indexed
    // Only prefetch if there's more data available.
    if (data?.hasMore && page + 1 < data?.pages) {
      Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ["tasks", "records", { ...filters, page: page + 1 }],
          queryFn: () => fetchTasksRecords({ ...filters, page: page + 1 }),
        }),
        queryClient.prefetchQuery({
          queryKey: ["tasks", "records", { ...filters, page: page + 2 }],
          queryFn: () => fetchTasksRecords({ ...filters, page: page + 2 }),
        }),
      ])
    }
    // Prefetch 2 pages before the current page and only if the current page is not the first one
    if (page + 2 <= data?.pages && page > 1) {
      Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ["tasks", "records", { ...filters, page: page - 1 }],
          queryFn: () => fetchTasksRecords({ ...filters, page: page - 1 }),
        }),
        queryClient.prefetchQuery({
          queryKey: ["tasks", "records", { ...filters, page: page - 2 }],
          queryFn: () => fetchTasksRecords({ ...filters, page: page - 2 }),
        }),
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, filters])

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
