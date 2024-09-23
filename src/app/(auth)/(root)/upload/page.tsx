import TaskUploadForm from "@/components/task-upload-form"
import TableContainer from "@/components/tables/table-core/table-container"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { UploadIcon } from "@radix-ui/react-icons"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Subir archivos | AuditorIA",
  description: "Página para subir archivos de audio a AuditorIA",
}

export default function Page() {
  return (
    <main id='file-uploader' className='flex flex-col w-full'>
      <TableContainer>
        <TableTitleContainer>
          <UploadIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
          <TypographyH4>Subir archivos</TypographyH4>
        </TableTitleContainer>
        <TaskUploadForm />
      </TableContainer>
    </main>
  )
}
