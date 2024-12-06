/* eslint-disable @typescript-eslint/no-unused-vars -- Disabled while testing */
"use client"
import * as React from "react"
import ServerDataTable from "@/components/tables/table-core/server-data-table"
import TableContainer from "@/components/tables/table-core/table-container"
import { columns } from "@/components/tables/troublesome-tasks/columns-troublesome-tasks"
import { TaskRecordsResponseSchema } from "@/components/tables/troublesome-tasks/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getHost } from "@/lib/actions"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { z } from "zod"
import { useDebounce } from "use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const originalTaskRecordsParamsSchema = TaskRecordsResponseSchema.pick({
  uuid: true,
  file_name: true,
  status: true,
  user: true,
  campaign: true,
})

const taskRecordsParamsSchema = originalTaskRecordsParamsSchema.extend({
  uuid: z.string().nullable(),
  file_name: z.string().nullable(),
  page: z.number(),
  globalSearch: z.string().nullable(),
})
type TaskRecordsSearchParams = z.infer<typeof taskRecordsParamsSchema>

const fetchTroublesomeTasks = async (params: TaskRecordsSearchParams) => {
  const url = new URL(`${await getHost()}/api/tasks-records`)
  const { page, globalSearch, ...filterParams } = params

  // Check if all filter params are nullish
  const areAllFiltersEmpty = Object.values(filterParams).every(
    value => value === null || value === undefined
  )

  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  if (areAllFiltersEmpty && globalSearch !== null) {
    url.searchParams.set("search", globalSearch)
  }

  // Always set page
  url.searchParams.set("page", page.toString())

  return fetch(url.toString()).then(async res => await res.json())
}

export default function TroublesomeTasksPage() {
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
  })
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ["tasks", "records", page, filters],
      queryFn: () => fetchTroublesomeTasks(filters),
      placeholderData: keepPreviousData,
    })

  // Update filters when search changes
  React.useEffect(() => {
    queryClient.cancelQueries({ queryKey: ["tasks", "records", page, filters] })
    setFilters(prev => ({
      ...prev,
      // Reset all values to null/empty
      uuid: null,
      file_name: null,
      status: null,
      user: null,
      campaign: null,
      // Only set the selected filter to have a value
      [selectedFilter || "globalSearch"]: debouncedSearch,
      page: 0,
    }))
    setPage(0) // Reset page when search changes

    if (isError) {
      toast({ title: "Error al cargar los datos", variant: "destructive" })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- This is intentional. We want to run the effect only when the search or selectedFilter changes.
  }, [debouncedSearch, selectedFilter])
  return (
    <TableContainer>
      <section className='flex justify-start items-center gap-2'>
        <Input
          placeholder='Buscar tarea...'
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          onValueChange={(value: keyof TaskRecordsSearchParams) => {
            setSelectedFilter(value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar filtro...' />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value='globalSearch' className='text-muted-foreground'>
              Seleccionar filtro...
            </SelectItem>
            <SelectItem value='uuid'>ID</SelectItem>
            <SelectItem value='file_name'>Nombre de archivo</SelectItem>
            <SelectItem value='status'>Estado</SelectItem>
            <SelectItem value='user'>Agente</SelectItem>
            <SelectItem value='campaign'>Campaña</SelectItem>
          </SelectContent>
        </Select>
        <div className='flex flex-row justify-start items-center gap-2'>
          <Button
            onClick={() => {
              setPage(old => old - 1)
              setFilters(prev => ({
                ...prev,
                page: prev.page - 1,
              }))
            }}
            variant={"outline"}
            size='icon'
            disabled={page === 0}
          >
            <ChevronLeftIcon size={GLOBAL_ICON_SIZE} />
          </Button>
          <Button
            onClick={() => {
              if (!isPlaceholderData && data.hasMore) {
                setPage(old => old + 1)
                setFilters(prev => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
            }}
            variant={"outline"}
            size='icon'
            disabled={!data?.hasMore}
          >
            <ChevronRightIcon size={GLOBAL_ICON_SIZE} />
          </Button>
        </div>
      </section>
      {!isPending && !isError && (
        <ServerDataTable
          columns={columns}
          data={data?.tasks ? data.tasks : []}
        />
      )}
      {isError && <div className='text-error'>{error?.message}</div>}
      {(isPending || isFetching) && <>Cargando...</>}
    </TableContainer>
  )
}
