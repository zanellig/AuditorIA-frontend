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

interface UseTasksRecordsParams {
  initialFilters?: Partial<TaskRecordsSearchParams>
}

export function useTasksRecords({
  initialFilters = {},
}: UseTasksRecordsParams) {
  const [page, setPage] = React.useState(0)
  const [search, setSearch] = React.useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = React.useState<
    keyof TaskRecordsSearchParams | null
  >(null)
  const [debouncedSearch] = useDebounce(search, 500)
  const [filters, setFilters] = React.useState<TaskRecordsSearchParams>({
    uuid: null,
    file_name: null,
    status: null,
    user: null,
    campaign: null,
    page: 0,
    globalSearch: null,
    ...initialFilters,
  })

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
  } = useQuery({
    queryKey: ["tasks", "records", page, filters],
    queryFn: () => fetchTasksRecords(filters),
    enabled: true,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    // Cancel any in-flight queries
    queryClient.cancelQueries({ queryKey: ["tasks", "records", page, filters] })

    // Remove previous queries to free up resources
    queryClient.removeQueries({ queryKey: ["tasks", "records", page, filters] })

    setFilters(prev => ({
      ...prev,
      uuid: null,
      file_name: null,
      status: null,
      user: null,
      campaign: null,
      [selectedFilter || "globalSearch"]: debouncedSearch,
      page: 0,
    }))
    setPage(0)

    if (isError) {
      toast({ title: "Error al cargar los datos", variant: "destructive" })
    }
  }, [debouncedSearch])

  React.useEffect(() => {
    if (!data?.success) return
    // Only prefetch if there's more data available.
    if (data?.hasMore) {
      Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: [
            "tasks",
            "records",
            page + 1,
            { ...filters, page: page + 1 },
          ],
          queryFn: () => fetchTasksRecords({ ...filters, page: page + 1 }),
        }),
        queryClient.prefetchQuery({
          queryKey: [
            "tasks",
            "records",
            page + 2,
            { ...filters, page: page + 2 },
          ],
          queryFn: () => fetchTasksRecords({ ...filters, page: page + 2 }),
        }),
      ])
    }
    if (page + 2 <= data?.pages) {
      Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: [
            "tasks",
            "records",
            page - 1,
            { ...filters, page: page - 1 },
          ],
          queryFn: () => fetchTasksRecords({ ...filters, page: page - 1 }),
        }),
        queryClient.prefetchQuery({
          queryKey: [
            "tasks",
            "records",
            page - 2,
            { ...filters, page: page - 2 },
          ],
          queryFn: () => fetchTasksRecords({ ...filters, page: page - 2 }),
        }),
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, filters])

  const updateFilters = (newFilters: Partial<TaskRecordsSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const fetchWithNewFilters = (
    newFilters: Partial<TaskRecordsSearchParams>
  ) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    queryClient.invalidateQueries({
      queryKey: ["tasks", "records", updatedFilters],
    })
  }

  const resetFilters = () => {
    setFilters({
      uuid: null,
      file_name: null,
      status: null,
      user: null,
      campaign: null,
      page: 0,
      globalSearch: null,
    })
    setSearch(null)
    setSelectedFilter("globalSearch")
    setPage(0)
  }

  const setNextPage = () => {
    setPage(old => (data?.success && data?.hasMore ? old + 1 : old))
    setFilters(prev => ({
      ...prev,
      page: data?.success && data?.hasMore ? prev.page + 1 : prev.page,
    }))
  }

  const setPreviousPage = () => {
    if (page > 0) {
      setPage(old => old - 1)
      setFilters(prev => ({
        ...prev,
        page: prev.page > 0 ? prev.page - 1 : 0,
      }))
    }
  }

  const setLastPage = () => {
    if (!data?.success) return
    const lastPage = Math.floor(data.total / 10)
    setPage(lastPage)
    setFilters(prev => ({
      ...prev,
      page: lastPage,
    }))
  }

  const setFirstPage = () => {
    setPage(0)
    setFilters(prev => ({
      ...prev,
      page: 0,
    }))
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
    fetchWithNewFilters,
    refetch,
    resetFilters,
    setNextPage,
    setPreviousPage,
    setLastPage,
    setFirstPage,
  }
}
