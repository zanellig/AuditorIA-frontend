import TaskUploadForm from "@/components/forms/task-upload-form"
import TableContainer from "@/components/tables/table-core/table-container"
import TitleContainer from "@/components/title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { UploadIcon } from "@radix-ui/react-icons"
import { Metadata } from "next"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"

export const metadata: Metadata = {
  title: "Subir archivos | AuditorIA",
  description: "Página para subir archivos de audio a AuditorIA",
}

export default function Page() {
  return (
    <main id='file-uploader' className='flex flex-col w-full'>
      <TableContainer>
        <TitleContainer separate>
          <UploadIcon className={DASHBOARD_ICON_CLASSES} />
          <TypographyH4>Subir archivos</TypographyH4>
        </TitleContainer>
        <TaskUploadForm />
      </TableContainer>
    </main>
  )
}
