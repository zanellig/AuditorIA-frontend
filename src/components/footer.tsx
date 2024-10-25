import { CopyrightIcon } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import ParagraphP from "@/components/typography/paragraphP"
import { cn } from "@/lib/utils"
import Link from "next/link"
import A from "./typography/a"

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "sticky bottom-0 w-full p-4 flex flex-row justify-center items-center  bg-muted shadow-md text-muted-foreground z-1 h-14",
        className
      )}
    >
      <ParagraphP className='flex flex-row justify-center space-x-2 items-center text-sm'>
        <CopyrightIcon size={GLOBAL_ICON_SIZE * 0.75} />
        <span>
          <Link
            href='https://www.linksolution.com.ar/'
            target='_blank'
            className='font-medium text-primary underline underline-offset-4'
          >
            LinkSolution SRL
          </Link>{" "}
          - Todos los derechos reservados.
        </span>
      </ParagraphP>
    </footer>
  )
}
