"use client"

import { useEffect, useState } from "react"
import { headers } from "next/headers"
import { getTasks } from "@/lib/actions"

import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import { Tasks } from "@/lib/types"
import DashboardSkeleton from "./skeletons/dashboard-skeleton"
import TableContainer from "./tables/table-core/table-container"
import SubtitleH2 from "./typography/subtitleH2"

export default async function TablaTareas() {
  const headersList = headers()
  const origin = headersList.get("origin")

  const [tasks, setTasks] = useState<Tasks | null>(null)
  useEffect(() => {
    const updateTasks = async () => {
      getTasks(origin as string).then(updatedTasks => {
        setTasks(updatedTasks)
        console.log(updatedTasks)
      })
    }

    updateTasks()
  }, [])

  return (
    <TableContainer>
      <SubtitleH2>Transcripciones</SubtitleH2>
      {tasks ? (
        <DataTable columns={columns} data={tasks} type={"tasks"} />
      ) : (
        <DashboardSkeleton />
      )}
    </TableContainer>
  )
}
