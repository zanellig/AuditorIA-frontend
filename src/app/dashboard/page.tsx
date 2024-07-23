import TablaTasks from "@/components/tables/tasks-table/tasks-table.server"
import EnvioDeTareas from "@/components/envio-de-tareas"
import TablaRecordings from "@/components/tables/records-table/recordings-table.server"

import { Suspense } from "react"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import TableContainer from "@/components/tables/table-core/table-container"
import SubtitleH2 from "@/components/typography/subtitleH2"

export default function Dashboard() {
  /**
   * UNCOMMENT TO SHOW SKELETON ALWAYS
   */
  // return <DashboardSkeleton />

  return (
    <>
      <div className='flex flex-col w-full h-full p-2'>
        <EnvioDeTareas className='mx-auto' />
        <TableContainer>
          <SubtitleH2>Tareas</SubtitleH2>
          <Suspense fallback={<DashboardSkeleton />}>
            <TablaTasks />
          </Suspense>
        </TableContainer>

        <TableContainer className='w-full'>
          <SubtitleH2>Grabaciones</SubtitleH2>
          <Suspense fallback={<DashboardSkeleton />}>
            <TablaRecordings />
          </Suspense>
        </TableContainer>
      </div>
    </>
  )
}

// TODO: Limitar por campaña o días
// TODO: <DONE!> Hacer dinámica la ruta donde se encuentren los audios
// TODO?: Cargar lista de campañas para automatizar transcripción y análisis de sentiment
