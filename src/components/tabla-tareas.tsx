"use client"
import DataTable from "@/components/data-table"
import { columns } from "@/lib/columns-tareas"
import { getTasks } from "@/lib/actions"
import { useEffect, useState } from "react"
import { Tasks } from "@/lib/types"
import DashboardSkeleton from "./skeletons/dashboard-skeleton"
import TableContainer from "./table-core/table-container"
import SubtitleH2 from "./typography/subtitleH2"

export default async function TablaTareas() {
  const [tasks, setTasks] = useState<Tasks | null>(null)
  useEffect(() => {
    const updateTasks = async () => {
      getTasks().then(updatedTasks => {
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
