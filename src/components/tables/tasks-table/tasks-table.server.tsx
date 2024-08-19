"use client"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales, Tasks } from "@/lib/types.d"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { useEffect, useState } from "react"

export default function TasksTable() {
  const [err, setErr] = useState(null)
  const [tasks, setTasks] = useState<Tasks | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [err, res] = await fetch("http://localhost:3001/api/tasks", {
        method: "GET",
      }).then(async res => await res.json())
      setErr(err)
      setTasks(res.tasks)
    }

    fetchData()
  }, [])

  if (err !== null) {
    return (
      <ErrorCodeUserFriendly error={err} locale={SupportedLocales.SPANISH} />
    )
  }

  if (tasks !== null) {
    console.log(tasks, "data from tasks table")
    return <DataTable columns={columns} data={tasks} type={"tasks"} />
  }

  return <DashboardSkeleton />
}
