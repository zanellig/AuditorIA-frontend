import ParagraphP from "@/components/typography/paragraphP"
import SubtitleH2 from "@/components/typography/subtitleH2"
import TitleH1 from "@/components/typography/titleH1"
import ErrorRetryButton from "@/components/error/error-button.client"
import { SupportedLocales } from "@/lib/types"
import { z } from "zod"

interface ErrorCodeUserFriendlyProps {
  error: Error | null
  locale: z.infer<typeof SupportedLocales>
  reset?: () => void
}

export function ErrorCodeUserFriendly({
  error,
  locale,
  reset,
}: ErrorCodeUserFriendlyProps) {
  if (!error) return null
  const content = {
    [SupportedLocales.Values.es]: {
      title: "¡Ha ocurrido un error cargando este sitio!",
      paragraph:
        "Contacte a su administrador de IT y otorgue el siguiente código de error:",
      messagePrefix: "Mensaje: ",
      stackPrefix: "Stack: ",
    },
    [SupportedLocales.Values.en]: {
      title: "An error occurred loading this site!",
      paragraph:
        "Contact your IT administrator and give the following error code:",
      messagePrefix: "Message: ",
      stackPrefix: "Stack: ",
    },
  }
  const localizedContent = content[locale]

  return (
    <div className='flex flex-col space-y-10'>
      <TitleH1>{localizedContent.title}</TitleH1>
      <ParagraphP>{localizedContent.paragraph}</ParagraphP>
      <SubtitleH2>{error.message}</SubtitleH2>
      <div className='flex flex-row space-x-2 justify-start'>
        <ErrorRetryButton locale={locale} reset={reset} />
      </div>
    </div>
  )
}
