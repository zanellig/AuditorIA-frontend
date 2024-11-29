import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function DashboardSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Skeleton className='h-10 bg-pulse dark:bg-secondary w-full' />
      <div className='flex space-x-2 items-center justify-between w-full'>
        <div className='flex space-x-2 items-center'>
          <Skeleton className='h-8 w-[300px] bg-pulse dark:bg-secondary' />
          <Skeleton className='h-8 w-[150px] bg-pulse dark:bg-secondary' />
          <FilterButtonSkeleton />
          <FilterButtonSkeleton />
          <FilterButtonSkeleton />
        </div>
      </div>

      <div className='flex flex-col space-y-2'>
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
        <SingleColumnSkeleton />
      </div>

      <PaginationSkeleton />
    </div>
  )
}

function FilterButtonSkeleton() {
  return <Skeleton className='h-8 w-10 bg-pulse dark:bg-secondary' />
}

function PaginationSkeleton() {
  return (
    <div className='flex justify-between items-center'>
      <Skeleton className='h-8 w-[500px] bg-pulse dark:bg-secondary' />
      <Skeleton className='h-8 w-[200px] bg-pulse dark:bg-secondary' />
      <div className='flex justify-between items-center gap-2'>
        <Skeleton className='h-8 w-10 bg-pulse dark:bg-secondary' />
        <Skeleton className='h-8 w-10 bg-pulse dark:bg-secondary' />
        <Skeleton className='h-8 w-10 bg-pulse dark:bg-secondary' />
      </div>
    </div>
  )
}

function SingleColumnSkeleton() {
  return <Skeleton className='h-10 w-full bg-pulse dark:bg-secondary' />
}
