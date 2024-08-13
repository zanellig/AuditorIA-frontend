import EnvioDeTareas from "@/components/envio-de-tareas"
import EnvioDeTareasServer from "@/components/envio-de-tareas.server"
import Footer from "@/components/footer"
import TableContainer from "@/components/tables/table-core/table-container"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UploadIcon } from "@radix-ui/react-icons"

export default function Page() {
  return (
    <ScrollArea className='max-h-dvh h-dvh pt-16 min-h-dvh justify-between'>
      <main id='file-uploader' className='flex flex-col px-2'>
        <TableContainer>
          <TableTitleContainer>
            <UploadIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
            <TypographyH4>Subir archivos</TypographyH4>
          </TableTitleContainer>
          <EnvioDeTareasServer />
        </TableContainer>
      </main>
      <Footer />
    </ScrollArea>
  )
}
