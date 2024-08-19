import { CopyrightIcon } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import ParagraphP from "@/components/typography/paragraphP"
import { cn } from "@/lib/utils"

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "h-fit w-full text-muted-foreground flex items-end py-4 m-4  justify-center bg-muted rounded-md shadow-md overflow-hidden",
        className
      )}
    >
      <ParagraphP className='flex flex-row justify-center space-x-2 items-center'>
        <CopyrightIcon size={GLOBAL_ICON_SIZE * 0.75} />
        <span>LinkSolution SRL - 2024 - Todos los derechos reservados.</span>
      </ParagraphP>
    </footer>
  )
}
