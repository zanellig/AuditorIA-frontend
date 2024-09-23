"use client"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { SupportedLocales } from "@/lib/types.d"
import { z } from "zod"

export default function ErrorRetryButton({
  reset,
  locale,
}: {
  reset?: () => void
  locale?: z.infer<typeof SupportedLocales>
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

function getRefreshLocale(locale?: z.infer<typeof SupportedLocales>) {
  switch (locale) {
    case SupportedLocales.Values.en:
      return "Retry"
    case SupportedLocales.Values.es:
      return "Reintentar"
    default:
      return "Reintentar"
  }
}
