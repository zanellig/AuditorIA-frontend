"use client"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { NavigationButtons } from "@/components/navigation/navigation"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import TitleH1 from "@/components/typography/titleH1"
import ParagraphP from "@/components/typography/paragraphP"

export default function ErrorScreen({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  return (
    <>
      <NavigationButtons />
      <div className='flex flex-col max-w-2xl my-auto mx-auto pt-16'>
        <div className='flex flex-col items-start space-y-5'>
          <TitleH1>¡Ha ocurrido un error! 😯</TitleH1>
          <ParagraphP>
            Contacte a su administrador de IT y otorgue el siguiente código de
            error:
          </ParagraphP>
          <div>
            <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
              {error?.message + "\n"}
              {error?.digest ? ` (digest: ${error.digest})\n` : "\n"}
              {error?.stack ? `\n${error.stack.slice(0, 512)}...` : ""}
            </code>
          </div>
          <Button
            variant='outline'
            className='w-fit'
            onClick={() => (reset ? reset() : null)}
          >
            Reintentar <RefreshCw size={GLOBAL_ICON_SIZE} className='ml-2' />
          </Button>
        </div>
      </div>
    </>
  )
}
