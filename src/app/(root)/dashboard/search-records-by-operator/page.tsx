"use client"
import * as React from "react"
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
import { DatePickerWithPresets } from "@/components/range-date-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Recordings } from "@/lib/types"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/records-table/columns-records"

export default function Page() {
  const { toast } = useToast()

  const [date, setDate] = React.useState<Date>()
  const [searchDate, setSearchDate] = React.useState<Date>()
  const [err, setErr] = React.useState<any>(null)
  const [recordings, setRecordings] = React.useState<Recordings | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [search, setSearch] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      if (!search) return
      setIsLoading(true)
      setRecordings(null)
      setErr(null)
      const [err, res] = await fetch(
        `http://localhost:3001/api/recordings?IDAPLICACION=${search}`,
        {
          method: "GET",
        }
      ).then(async res => {
        return await res.json()
      })
      setErr(err)
      setRecordings(res)
      setIsLoading(false)
    }

    fetchData()
  }, [search])

  React.useEffect(() => {}, [recordings])

  return (
    <div className='flex flex-row gap-2 p-4'>
      <Card className='w-fit h-fit'>
        <CardHeader>
          <CardTitle className='flex flex-row items-center gap-2'>
            <CalendarIcon className={DASHBOARD_ICON_CLASSES} /> Buscar audios
            por campaña
          </CardTitle>
          <CardDescription>
            Ingrese la campaña en el formulario para buscar audios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={input}
            onChange={e => {
              setInput(e.target.value)
            }}
          />
        </CardContent>
        <CardFooter>
          <Button
            className='flex flex-row items-center gap-2 w-full'
            onClick={() => {
              if (!(input.length > 0)) {
                toast({
                  title: "Debe ingresar un numero de Campaña",
                  variant: "destructive",
                })
                return
              }
              setSearch(input)
            }}
          >
            <ArrowRightIcon className={DASHBOARD_ICON_CLASSES} />
            Buscar audios
          </Button>
        </CardFooter>
      </Card>
      {err !== null && (
        <div className='flex flex-col gap-2'>
          <Card>
            <CardHeader>
              <CardTitle> Error </CardTitle>
              <CardDescription className='text-warning'>
                {JSON.parse(err).detail}
              </CardDescription>
            </CardHeader>
          </Card>
          <DataTable columns={columns} data={[]} type='records' />
        </div>
      )}
      {recordings === null && err === null && isLoading === false ? (
        <DataTable columns={columns} data={[]} type='records' />
      ) : null}
      {isLoading && <DashboardSkeleton />}
      {recordings !== null && (
        <div className='flex flex-col gap-2'>
          <Card>
            <CardHeader>
              <CardTitle> Resultados </CardTitle>
              <CardDescription className='text-success'>
                {recordings.length} audios encontrados.{" "}
              </CardDescription>
            </CardHeader>
          </Card>
          <DataTable
            columns={columns}
            data={recordings}
            recordings={recordings}
            type='records'
          />
        </div>
      )}
    </div>
  )
}
