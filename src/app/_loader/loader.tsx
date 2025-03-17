import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Loader2 } from "lucide-react"

export default function LoaderScreen() {
  return (
    <main className='flex flex-col gap-2 w-full h-full justify-center items-center'>
      <Loader2
        size={GLOBAL_ICON_SIZE}
        className='animate-spin text-primary dark:text-secondary'
      />
    </main>
  )
}
