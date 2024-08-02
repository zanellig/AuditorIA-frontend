import TablaTasks from "@/components/tables/tasks-table/tasks-table.server"
import TablaRecordings from "@/components/tables/records-table/recordings-table.server"
import TableContainer from "@/components/tables/table-core/table-container"
import { Suspense } from "react"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import SubtitleH2 from "@/components/typography/subtitleH2"
export default function Page() {
  return (
    <main id='tables'>
      <TableContainer className='w-full'>
        <SubtitleH2 className='pb-4'>Tareas</SubtitleH2>
        <Suspense fallback={<DashboardSkeleton />}>
          <TablaTasks />
        </Suspense>
      </TableContainer>
      <TableContainer>
        <SubtitleH2 className='pb-4'>Grabaciones</SubtitleH2>
        <Suspense fallback={<DashboardSkeleton />}>
          <TablaRecordings />
        </Suspense>
      </TableContainer>
    </main>
  )
}
