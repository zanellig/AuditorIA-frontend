"use client"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { SupportedLocales } from "@/lib/types.d"

export default function ErrorRetryButton({
  reset,
  locale,
}: {
  reset?: () => void
  locale?: SupportedLocales
}) {
  return (
    <Button
      variant='outline'
      className='w-fit'
      onClick={() => (reset ? reset() : null)}
    >
      {getRefreshLocale(locale)}{" "}
      <RefreshCw size={GLOBAL_ICON_SIZE} className='ml-2' />
    </Button>
  )
}

function getRefreshLocale(locale?: SupportedLocales) {
  switch (locale) {
    case SupportedLocales.ENGLISH:
      return "Retry"
    case SupportedLocales.SPANISH:
      return "Reintentar"
    default:
      return "Reintentar"
  }
}
