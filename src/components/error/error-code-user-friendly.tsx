import ParagraphP from "@/components/typography/paragraphP"
import SubtitleH2 from "@/components/typography/subtitleH2"
import TitleH1 from "@/components/typography/titleH1"
import ErrorRetryButton from "@/components/error/error-button.client"
import { getErrorStringLocale } from "@/lib/get-error-string-locale"
import { SupportedLocales } from "@/lib/types.d"
import { Button } from "../ui/button"
import { handleCopyToClipboard } from "@/lib/utils"
import { useToast } from "../ui/use-toast"
import { z } from "zod"

interface ErrorCodeUserFriendlyProps {
  error: any
  locale: z.infer<typeof SupportedLocales>
}

export function ErrorCodeUserFriendly({
  error,
  locale,
}: ErrorCodeUserFriendlyProps) {
  const { toast } = useToast()
  if (!error) return null
  const content = {
    [SupportedLocales.Values.es]: {
      title: "¡Ha ocurrido un error cargando la lista! 😯",
      paragraph:
        "Contacte a su administrador de IT y otorgue el siguiente código de error:",
      messagePrefix: "Mensaje: ",
      stackPrefix: "Stack: ",
    },
    [SupportedLocales.Values.en]: {
      title: "An error occurred loading the list! 😯",
      paragraph:
        "Contact your IT administrator and give the following error code:",
      messagePrefix: "Message: ",
      stackPrefix: "Stack: ",
    },
  }
  const localizedContent = content[locale]
  if (!error.stack) {
    const errDetail = JSON.parse(error).detail
    return (
      <div className='flex flex-col space-y-10'>
        <TitleH1>{localizedContent.title}</TitleH1>
        <ParagraphP>{localizedContent.paragraph}</ParagraphP>
        <code>{errDetail ? errDetail : error.message}</code>
      </div>
    )
  }

  return (
    <div className='flex flex-col space-y-10'>
      <TitleH1>{localizedContent.title}</TitleH1>
      <ParagraphP>{localizedContent.paragraph}</ParagraphP>
      <SubtitleH2>{getErrorStringLocale({ error, locale })}</SubtitleH2>
      <code>
        {localizedContent.messagePrefix + error.message}
        <br />
        <br />
        {localizedContent.stackPrefix + error.stack.slice(0, 512)}
      </code>
      <div className='flex flex-row space-x-2 justify-start'>
        <ErrorRetryButton locale={locale} />
        <Button
          variant='outline'
          className='w-fit p-2'
          onClick={() => {
            handleCopyToClipboard(error.stack)
            toast({
              title: "Copiado al portapapeles",
            })
          }}
        >
          Copiar código de error
        </Button>
      </div>
    </div>
  )
}
