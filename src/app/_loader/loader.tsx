import { Loader2 } from "lucide-react"

export default function Loader() {
  return (
    <main className='flex flex-col gap-2 w-full h-full justify-center items-center'>
      <Loader2 className='h-20 w-20 animate-spin text-primary dark:text-secondary' />
    </main>
  )
}
