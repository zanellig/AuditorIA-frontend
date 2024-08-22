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
import { Task, Tasks } from "@/lib/types.d"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"

export default function Page() {
  const { toast } = useToast()

  const [date, setDate] = React.useState<Date>()
  const [searchDate, setSearchDate] = React.useState<Date>()
  const [err, setErr] = React.useState<any>(null)
  const [tasks, setTasks] = React.useState<Tasks | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setTasks(null)
      setErr(null)
      const [err, res] = await fetch(`http://localhost:3001/api/tasks`, {
        method: "GET",
      }).then(async res => {
        return await res.json()
      })
      setErr(err)
      setTasks(res)
      setIsLoading(false)
    }

    fetchData()
  }, [searchDate])

  React.useEffect(() => {}, [tasks])

  return (
    <div className='flex flex-col gap-2 p-4'>
      {tasks === null && err === null && isLoading === false ? (
        <DataTable columns={columns} data={[]} type='records' />
      ) : null}

      {isLoading && <DashboardSkeleton />}

      {tasks !== null && (
        <div className='flex flex-col gap-2'>
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription className='text-success'>
                {tasks.length} tareas encontrados.
              </CardDescription>
            </CardHeader>
          </Card>
          <DataTable columns={columns} data={tasks} type='tasks' />
        </div>
      )}
    </div>
  )
}
