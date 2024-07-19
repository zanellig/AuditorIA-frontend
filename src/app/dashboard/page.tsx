// "use client" // COMENTADO HASTA QUE SE LEVANTE LA API
import type { Tasks, Task } from "@/lib/types"
import TablaTareas from "@/components/tabla-tareas"
import EnvioDeTareas from "@/components/envio-de-tareas"
import TablaRecords from "@/components/tabla-records"

import { Suspense } from "react"

// async function getMockAllTasks(): Promise<Tasks> {
//   const TASKS_FILE_PATH = path.join(
//     process.cwd(),
//     "public",
//     "mock",
//     "updated_tasks.json"
//   )
//   let rawData = await fs.readFile(TASKS_FILE_PATH, "utf8")
//   let data: Tasks = await JSON.parse(rawData)

//   return data
// }

export default function Dashboard() {
  // const tasks = await getMockAllTasks()
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

  return (
    <>
      <div className='flex flex-col w-full h-full'>
        <TablaTareas />

        <div className='flex flex-row w-full'>
          <TablaRecords />
          <EnvioDeTareas />
        </div>
      </div>
    </>
  )
}

// TODO: Limitar por campaña o días
// TODO: <DONE!> Hacer dinámica la ruta donde se encuentren los audios
// TODO?: Cargar lista de campañas para automatizar transcripción y análisis de sentiment
