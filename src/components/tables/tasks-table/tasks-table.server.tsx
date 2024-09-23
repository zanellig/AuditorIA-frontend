"use client"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales, TableSupportedDataTypes, Tasks } from "@/lib/types.d"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { useEffect, useState } from "react"
import { TESTING } from "@/lib/consts"

export default function TasksTable() {
  if (TESTING) {
    return (
      <DataTable
        columns={columns}
        data={[]}
        type={TableSupportedDataTypes.Tasks}
      />
    )
  }
  const [err, setErr] = useState(null)
  const [tasks, setTasks] = useState<Tasks | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [err, res] = await fetch("http://10.20.30.211:3001/api/tasks", {
        method: "GET",
      }).then(async res => await res.json())
      if (err !== null) {
        setErr(err)
        return
      }
      setTasks(res)
    }

    fetchData()
  }, [])

  if (err !== null) {
    return (
      <ErrorCodeUserFriendly error={err} locale={SupportedLocales.Values.es} />
    )
  }
  if (tasks !== null) {
    return
  }
  return <DashboardSkeleton />
}
