// "use client" // COMENTADO HASTA QUE SE LEVANTE LA API
import type { Tasks, Task } from "@/lib/tasks"
import TablaTareas from "@/components/TablaTareas"
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton"
import ErrorScreen from "@/components/error-handlers/error-screen"
import { _urlBase, _tasksPath } from "@/lib/api/paths"
import { useEffect, useState } from "react"
import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * SIN USAR HASTA QUE SE LEVANTE LA API / MANDAR A PRODUCCIÓN
 */
async function getTasks() {
  const url = `${_urlBase}${_tasksPath}`

  const response = await fetch(url, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    method: "GET",
    next: {
      revalidate: 5,
    },
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const jsonRes = await response.json()

  return jsonRes.tasks as Tasks
}

async function getMockAllTasks(): Promise<Tasks> {
  const TASKS_FILE_PATH = path.join(
    process.cwd(),
    "public",
    "mock",
    "updated_tasks.json"
  )
  let rawData = await fs.readFile(TASKS_FILE_PATH, "utf8")
  let data: Tasks = await JSON.parse(rawData)

  return data
}

export default async function Dashboard() {
  const tasks = await getMockAllTasks()
  // const [isLoading, setLoadingStatus] = useState(true)
  // const [fetchError, setError] = useState<Error | null>(null)
  // const [tasks, setTasks] = useState<Tasks | null>(null)
  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     try {
  //       const tasks = await getTasks()
  //       setTasks(tasks)
  //       setLoadingStatus(false)
  //     } catch (error: any) {
  //       setError(error)
  //       setLoadingStatus(false)
  //     }
  //   }
  //   fetchTasks()
  // }, [])

  /**
   * UNCOMMENT TO SHOW SKELETON ALWAYS
   */
  // return <DashboardSkeleton />

  // if (isLoading) return <DashboardSkeleton />
  // if (!!fetchError)
  //   return <ErrorScreen error={fetchError} />
  if (tasks) {
    return (
      <>
        <TablaTareas tareas={tasks} />
      </>
    )
  }
}

// TODO: Limitar por campaña o días
// TODO: <DONE!> Hacer dinámica la ruta donde se encuentren los audios
// TODO?: Cargar lista de campañas para automatizar transcripción y análisis de sentiment
