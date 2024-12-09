import { Status } from "@/lib/types.d"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  CircleCheck,
  CircleDashed,
  CircleAlert,
  CircleHelp,
} from "lucide-react"

export function renderMarker(status: Status) {
  switch (status) {
    case "completed":
    case "analyzed":
      return <CircleCheck size={GLOBAL_ICON_SIZE} className='text-green-500' />
    case "processing":
    case "analyzing":
    case "pending":
      return (
        <CircleDashed
          size={GLOBAL_ICON_SIZE}
          className='text-muted-foreground animate-spin'
        />
      )
    case "failed":
      return (
        <CircleAlert
          size={GLOBAL_ICON_SIZE}
          className='text-red-500 animate-pulse'
        />
      )
    default:
      return <CircleHelp size={GLOBAL_ICON_SIZE} className='text-muted-foreground animate-pulse' />
  }
}
