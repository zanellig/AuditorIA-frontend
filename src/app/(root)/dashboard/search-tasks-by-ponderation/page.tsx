"use client"
import * as React from "react"
import {
  Card,
  
  CardDescription,
 
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { extractYearMonthDayFromDate } from "@/lib/utils"
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

  React.useEffect(() => {
    async function fetchData() {
      if (!searchDate) return
      setIsLoading(true)
      setRecordings(null)
      setErr(null)
      const normalizedDateSearchQuery = extractYearMonthDayFromDate(searchDate)
      const [err, res] = await fetch(
        `http://localhost:3001/api/recordings?fecha=${normalizedDateSearchQuery}`,
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
  }, [searchDate])

  React.useEffect(() => {}, [recordings])

  return (
    <div className='flex flex-col gap-2 p-4'>
      {recordings === null && err === null && isLoading === false ? (
        <DataTable columns={columns} data={[]} type='records' />
      ) : null}

      {isLoading && <DashboardSkeleton />}

      {recordings !== null && (
        <div className='flex flex-col gap-2'>
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription className='text-success'>
                {recordings.length} audios encontrados.
              </CardDescription>
            </CardHeader>
          </Card>
          <DataTable columns={columns} data={recordings} type='records' />
        </div>
      )}
    </div>
  )
}
