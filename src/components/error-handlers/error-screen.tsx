"use client"
import { useEffect } from "react"
import { Button } from "../ui/button"
import { RefreshCw } from "lucide-react"
import NavigationButtons from "../navigation"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

export default function ErrorScreen({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <NavigationButtons />
      <div className='flex flex-col max-w-2xl my-auto mx-auto pt-16'>
        <div className='flex flex-col items-start space-y-5'>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
            ¡Ha ocurrido un error! 😯
          </h1>
          <p className='leading-7 [&:not(:first-child)]:mt-6'>
            Contacte a su administrador de IT y otorgue el siguiente código de
            error:
          </p>
          <div>
            <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
              {error?.message}
              {error?.digest ? ` (${error.digest})` : ""}
              {error?.stack ? `\n${error.stack.slice(0, 255)}...` : ""}
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
