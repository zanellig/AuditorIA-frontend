import { CopyrightIcon } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import ParagraphP from "@/components/typography/paragraphP"

export default function Footer() {
  return (
    <footer className='h-fit w-full text-muted-foreground flex items-end py-4 mt-8 justify-center bg-muted rounded-md shadow-md'>
      <ParagraphP className='flex flex-row justify-center space-x-2 items-center'>
        <CopyrightIcon size={GLOBAL_ICON_SIZE * 0.75} />
        <span>LinkSolution SRL - 2024 - Todos los derechos reservados.</span>
      </ParagraphP>
    </footer>
  )
}
