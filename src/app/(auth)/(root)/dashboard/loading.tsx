import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Loader2 } from "lucide-react"

export default function DashboardLoadingScreen() {
  return (
    <main className='h-full w-full flex items-center justify-center'>
      <Loader2 size={GLOBAL_ICON_SIZE} className='animate-spin' />
    </main>
  )
}
