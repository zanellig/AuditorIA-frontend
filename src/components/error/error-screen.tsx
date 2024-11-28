"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { TopNavbar } from "@/components/navigation/navigation"
import TitleH1 from "@/components/typography/titleH1"
import ParagraphP from "@/components/typography/paragraphP"
import { ResetIcon, UpdateIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"

export default function ErrorScreen({
  error,
  reset,
  redirectUrl = "/dashboard",
  errorTitle = "¡Ha ocurrido un error! 😯",
  id,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
  redirectUrl?: string
  errorTitle?: string
  id?: string
}) {
  if (!id) id = "generic-error-screen"
  const router = useRouter()
  return (
    <>
      <main id={id} className='flex flex-col'>
        <TopNavbar />
        <div className='flex flex-col items-start space-y-5 p-16'>
          <TitleH1>{errorTitle}</TitleH1>
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
          <section
            id='error-buttons'
            className='flex flex-row items-center space-x-4'
          >
            {redirectUrl && (
              <Button
                variant='outline'
                className='w-fit'
                onClick={() => router.back()}
              >
                <span>Volver</span>
                <ResetIcon className='w-[1.2rem] h-[1.2rem] ml-2' />
              </Button>
            )}
            <Button
              variant='outline'
              className='w-fit'
              onClick={() => reset && reset()}
            >
              <>
                <span>Reintentar</span>
                <UpdateIcon className='w-[1.2rem] h-[1.2rem] ml-2' />
              </>
            </Button>
          </section>
        </div>
      </main>
    </>
  )
}
