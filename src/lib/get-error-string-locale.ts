import { SupportedLocales } from "@/lib/types.d"
import { z } from "zod"

type ErrorMessages = Record<string, string>
type SupportedLocales = z.infer<typeof SupportedLocales>

// Dictionary of error messages by locale and error code
const errorMessages: Record<SupportedLocales, ErrorMessages> = {
  [SupportedLocales.Values.en]: {
    UND_ERR_CONNECT_TIMEOUT: "Check your VPN connection 🔒",
    ECONNREFUSED: "Connection refused from server ❌",
    ENETUNREACH: "Check your internet connection 🌎",
    DEFAULT: "An unexpected error has occurred 🤨",
    "": "An unexpected error has occurred 🤨",
  },
  [SupportedLocales.Values.es]: {
    UND_ERR_CONNECT_TIMEOUT: "Compruebe la conexión a la VPN 🔒",
    ECONNREFUSED: "Se ha rechazado la conexión desde el servidor ❌",
    ENETUNREACH: "Compruebe la conexión a internet 🌎",
    DEFAULT: "Ha ocurrido un error inesperado 🤨",
    "": "Ha ocurrido un error inesperado 🤨",
  },
  // Add more locales here in the future...
}

// Function to get a user-friendly error message
export function getErrorStringLocale({
  error,
  locale,
  logError = false,
}: {
  error: any
  locale: SupportedLocales
  logError?: boolean // Optional logging
}) {
  const errorCode = error?.cause?.code

  if (logError && !errorMessages[locale]?.[errorCode]) {
    console.warn(
      `Error code "${errorCode}" not found for locale "${locale}". Using fallback message.`
    )
  }

  // Get localized error message, fallback to DEFAULT if error code is not found
  const localizedError =
    errorMessages[locale]?.[errorCode] || errorMessages[locale]?.DEFAULT

  // If locale-specific messages don't exist, fallback to Spanish as default
  return localizedError || errorMessages[SupportedLocales.Values.es].DEFAULT
}
