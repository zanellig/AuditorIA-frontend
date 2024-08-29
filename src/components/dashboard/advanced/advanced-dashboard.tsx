
import TasksTable from "@/components/tables/tasks-table/tasks-table.server"
import RecordingsTable from "@/components/tables/records-table/recordings-table.server"
import TableContainer from "@/components/tables/table-core/table-container"
import { FileTextIcon, SpeakerLoudIcon } from "@radix-ui/react-icons"
import { TypographyH4 } from "@/components/typography/h4"
import { Separator } from "@/components/ui/separator"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
export default function AdvancedDashboard() {
  return (
    <>
      <main id='tables' className='flex flex-col px-2 items-center py-4'>
        <TableContainer separate>
          <TableTitleContainer>
            <FileTextIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
            <TypographyH4>Tareas</TypographyH4>
          </TableTitleContainer>
          <Separator className='my-4' />
          <TasksTable />
        </TableContainer>

        <TableContainer>
          <TableTitleContainer>
            <SpeakerLoudIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
            <TypographyH4>Grabaciones</TypographyH4>
          </TableTitleContainer>
          <Separator className='my-4' />
          <RecordingsTable />
        </TableContainer>
      </main>
    </>
  )
}
