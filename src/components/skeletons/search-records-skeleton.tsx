import { Skeleton } from "@/components/ui/skeleton"

export default function SearchRecordsSkeleton() {
  return (
    <div className='flex flex-col gap-2 w-full justify-center items-center'>
      <Skeleton className='rounded-xl min-w-[350px] w-[350px] min-h-[200px] h-[200px] bg-pulse dark:bg-secondary' />
    </div>
  )
}
