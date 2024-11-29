import { Loader } from "lucide-react"

export default function LoaderScreen() {
  return (
    <main className='flex flex-col gap-2 w-full h-full justify-center items-center'>
      <Loader className='h-20 w-20 animate-spin text-primary dark:text-secondary' />
    </main>
  )
}
