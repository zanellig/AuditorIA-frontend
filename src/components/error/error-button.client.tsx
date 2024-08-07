"use client"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

export default function ErrorRetryButton({ reset }: { reset: () => void }) {
  return (
    <Button
      variant='outline'
      className='w-fit'
      onClick={() => (reset ? reset() : null)}
    >
      Reintentar <RefreshCw size={GLOBAL_ICON_SIZE} className='ml-2' />
    </Button>
  )
}
