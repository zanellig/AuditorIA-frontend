import { SupportedLocales } from "@/lib/types.d"

export function getErrorStringLocale({
  error,
  locale,
}: {
  error: any
  locale: SupportedLocales
}) {
  switch (locale) {
    case SupportedLocales.ENGLISH:
      return getErrorCodeUserFriendlyEnglish(error)
    case SupportedLocales.SPANISH:
      return getErrorCodeUserFriendlySpanish(error)
    default:
      return getErrorCodeUserFriendlySpanish(error)
  }
}

function getErrorCodeUserFriendlySpanish(error: any) {
  switch (error?.cause?.code) {
    case "UND_ERR_CONNECT_TIMEOUT":
      return "Compruebe la conexión a la VPN 🔒"
    case "ECONNREFUSED":
      return "Se ha rechazado la conexión desde el servidor ❌"
    case "ENETUNREACH":
      return "Compruebe la conexión a internet 🌎"
    default:
      return "Ha ocurrido un error inesperado 🤨"
  }
}

function getErrorCodeUserFriendlyEnglish(error: any) {
  switch (error?.cause?.code) {
    case "UND_ERR_CONNECT_TIMEOUT":
      return "Check your VPN connection 🔒"
    case "ECONNREFUSED":
      return "Connection refused from server ❌"
    case "ENETUNREACH":
      return "Check your internet connection 🌎"
    default:
      return "An unexpected error has occurred 🤨"
  }
}
