import TablaTasks from "@/components/tables/tasks-table/tasks-table.server"
import TablaRecordings from "@/components/tables/records-table/recordings-table.server"
import TableContainer from "@/components/tables/table-core/table-container"
import { Suspense } from "react"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileTextIcon, SpeakerLoudIcon } from "@radix-ui/react-icons"
import { TypographyH4 } from "@/components/typography/h4"
import { Separator } from "@/components/ui/separator"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
import Footer from "@/components/footer"
export default function Page({ reset }: { reset: () => void }) {
  return (
    <>
      <ScrollArea className='max-h-dvh h-dvh pt-16'>
        <main id='tables' className='flex flex-col px-2 items-center'>
          <TableContainer separate>
            <TableTitleContainer>
              <FileTextIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
              <TypographyH4>Tareas</TypographyH4>
            </TableTitleContainer>

            <Separator className='my-4' />
            <Suspense fallback={<DashboardSkeleton />}>
              <TablaTasks reset={reset} />
            </Suspense>
          </TableContainer>

          <TableContainer>
            <TableTitleContainer>
              <SpeakerLoudIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
              <TypographyH4>Grabaciones</TypographyH4>
            </TableTitleContainer>
            <Separator className='my-4' />
            <Suspense fallback={<DashboardSkeleton />}>
              <TablaRecordings reset={reset} />
            </Suspense>
          </TableContainer>
          <Footer />
        </main>
      </ScrollArea>
    </>
  )
}
