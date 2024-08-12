import ParagraphP from "@/components/typography/paragraphP"
import SubtitleH2 from "@/components/typography/subtitleH2"
import TitleH1 from "@/components/typography/titleH1"
import ErrorRetryButton from "@/components/error/error-button.client"
import { getErrorStringLocale } from "@/lib/get-error-string-locale"
import { SupportedLocales } from "@/lib/types.d"

interface ErrorCodeUserFriendlyProps {
  error: any
  locale: SupportedLocales
}

export function ErrorCodeUserFriendly({
  error,
  locale,
}: ErrorCodeUserFriendlyProps) {
  const content = {
    [SupportedLocales.SPANISH]: {
      title: "¡Ha ocurrido un error cargando la lista! 😯",
      paragraph:
        "Contacte a su administrador de IT y otorgue el siguiente código de error:",
      messagePrefix: "Mensaje: ",
      stackPrefix: "Stack: ",
    },
    [SupportedLocales.ENGLISH]: {
      title: "An error occurred loading the list! 😯",
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
      <SubtitleH2>{getErrorStringLocale({ error, locale })}</SubtitleH2>
      <code>
        {localizedContent.messagePrefix + error.message}
        <br />
        <br />
        {localizedContent.stackPrefix + error.stack.slice(0, 512)}
      </code>
      <ErrorRetryButton locale={locale} />
    </div>
  )
}
