import DataTable from "@/components/DataTable"
import { columns } from "@/lib/columns-tareas"
import { getTasks } from "@/app/actions"
import { useEffect, useState } from "react"
import { Tasks } from "@/lib/tasks"
import DashboardSkeleton from "./skeletons/DashboardSkeleton"

export default async function TablaTareas() {
  const [tasks, setTasks] = useState<Tasks | null>(null)
  useEffect(() => {
    const updateTasks = async () => {
      const updatedTasks = await getTasks()
      setTasks(updatedTasks)
    }

    updateTasks()
  }, [])

  if (!tasks) return <DashboardSkeleton />

  return <DataTable columns={columns} data={tasks} />
}
