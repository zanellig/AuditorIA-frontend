"use client"
import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowRightIcon, CalendarIcon } from "@radix-ui/react-icons"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Recordings } from "@/lib/types"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/records-table/columns-records"
import { DatePickerWithPresets } from "./range-date-picker"
import { extractYearMonthDayFromDate } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { TableSupportedDataTypes } from "@/lib/types.d"
import { CustomBorderCard } from "./custom-border-card"
import { StatefulButton } from "./stateful-button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"

type InputType = HTMLInputElement["type"]
type TSearchRecordsProps = {
  title: string
  icon: JSX.Element
  shouldEnterText: string
  _route: string
  inputOptions?: {
    inputType: InputType
    selectOptions?: string[]
  }
}

export default function SearchRecords({
  title,
  icon,
  shouldEnterText,
  _route,
  inputOptions,
}: TSearchRecordsProps) {
  const queryClient = useQueryClient()
  const [queryKey, setQueryKey] = React.useState<string | null>(null)

  const { inputType, selectOptions } = inputOptions || {
    inputType: "text",
    selectOptions: null,
  }
  const { toast } = useToast()
  const [input, setInput] = React.useState("")
  const [search, setSearch] = React.useState<string | null>(null)
  const [date, setDate] = React.useState<Date | null>(null)

  const [shouldFetch, setShouldFetch] = React.useState(false)

  React.useEffect(() => {
    // intercept the fetching and cancel it if the search or date or input change
    queryClient.cancelQueries({
      queryKey: [queryKey],
    })
    setQueryKey(`${date ? date.toISOString() : search}`)
  }, [search, date, input])

  // Function to fetch recordings based on input or date
  const fetchRecordings = async (signal: AbortSignal) => {
    const queryParam = date
      ? `fecha=${extractYearMonthDayFromDate(date)}`
      : `${_route}=${search}`

    const res = await fetch(`${await getHost()}/api/recordings?${queryParam}`, {
      method: "GET",
      signal,
    })
    if (!res.ok) {
      return []
    }
    const [err, data] = await res.json()
    if (err) {
      throw new Error(err.message)
    }
    if (data) {
      return data.records as Recordings
    }
    return []
  }

  const {
    data: recordings,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async ({ signal }) => {
      const res = await fetchRecordings(signal)
      setShouldFetch(false)
      return res
    },
    enabled: shouldFetch, // Fetch only when the button is clicked
    refetchOnWindowFocus: false,
  })

  const handleSearch = () => {
    if (!date && !(input.length > 0)) {
      toast({
        title: `Debe ingresar ${shouldEnterText}.`,
        variant: "destructive",
      })
      return
    }
    setSearch(input)
    setQueryKey(date ? date.toISOString() : input)
    setShouldFetch(true)
  }

  const handleCancel = () => {
    queryClient.cancelQueries({
      queryKey: [queryKey],
    })
  }

  React.useEffect(() => {
    if (error) {
      toast({
        title: error.message,
        variant: "destructive",
      })
    }
  }, [error])

  return (
    <div className='flex flex-col gap-2 w-full justify-center items-center'>
      <Card
        className='h-fit min-w-[350px] w-[350px]'
        onKeyDown={e => {
          if (e.key === "Enter") {
            handleSearch()
          }
          if (e.key === "Escape") {
            handleCancel()
          }
        }}
      >
        <CardHeader>
          <CardTitle className='flex flex-row items-center gap-2'>
            {icon}
            <span>Buscar audios por {title}</span>
          </CardTitle>
          <CardDescription>Ingrese {shouldEnterText} a buscar.</CardDescription>
        </CardHeader>
        <CardContent>
          {(inputType === "text" || inputType === "number") && (
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              type={inputType}
            />
          )}
          {inputType === "date" && (
            <DatePickerWithPresets onDateChange={setDate} />
          )}
          {inputType === "select" && (
            <Select value={input} onValueChange={value => setInput(value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccionar ${title}`} />
              </SelectTrigger>
              <SelectContent position='popper'>
                {selectOptions?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
        <CardFooter className='flex justify-start items-center gap-2'>
          <StatefulButton
            className='gap-2 w-full'
            onClick={handleSearch}
            isLoading={isLoading}
            icon={<ArrowRightIcon className={DASHBOARD_ICON_CLASSES} />}
          >
            <span>Buscar audios</span>
          </StatefulButton>
          {isLoading && (
            <Button variant={"destructive"} onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </CardFooter>
      </Card>

      <div
        className='flex flex-col gap-2 items-center w-full'
        id='recordings-container'
      >
        {error && (
          <>
            <CustomBorderCard description={error.message} variant={"error"} />
            <DataTable
              columns={columns}
              data={[]}
              type={TableSupportedDataTypes.Recordings}
              className='w-full'
            />
          </>
        )}

        {!isLoading && recordings === null && !error && (
          <>
            <CustomBorderCard
              description='No se han encontrado registros.'
              variant={"warning"}
            />
            <DataTable
              columns={columns}
              data={[]}
              type={TableSupportedDataTypes.Recordings}
              className='w-full'
            />
          </>
        )}

        {isLoading && <DashboardSkeleton />}

        {!isLoading && recordings && (
          <>
            <CustomBorderCard
              description={`${recordings.length} audios encontrados.`}
              variant={"success"}
            />
            <DataTable
              columns={columns}
              data={recordings}
              type={TableSupportedDataTypes.Recordings}
              className='w-full'
            />
          </>
        )}
      </div>
    </div>
  )
}
