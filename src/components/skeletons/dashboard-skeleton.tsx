"use client"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <>
      <div className='flex flex-col space-y-10'>
        <div className='flex flex-row space-x-2 items-center w-full justify-between'>
          <div className='flex flex-row space-x-4 items-center'>
            <Skeleton className='h-8 rounded-xl w-[300px] bg-pulse dark:bg-secondary' />
            <Skeleton className='h-6 rounded-xl w-[150px] bg-pulse dark:bg-secondary' />
          </div>

          <div className='flex flex-row space-x-4 ml-auto'>
            <Skeleton className='h-6 rounded-xl w-[200px] bg-pulse dark:bg-secondary' />
            <Skeleton className='h-6 rounded-xl w-[100px] bg-pulse dark:bg-secondary' />
          </div>
        </div>

        <div className='flex flex-col space-y-10'>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>

        <PaginationSkeleton />
      </div>
    </>
  )
}

function RowSkeleton() {
  return (
    <div className='space-x-4 flex flex-row'>
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
      <SingleColumnSkeleton />
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className='flex flex-row justify-between items-center'>
      <Skeleton className='h-5 w-[500px] rounded-xl bg-pulse dark:bg-secondary' />
      <Skeleton className='h-5 w-[200px] rounded-xl bg-pulse dark:bg-secondary' />
      <div className='flex justify-end flex-row space-x-5'>
        <SinglePaginationButtonSkeleton />
        <SinglePaginationButtonSkeleton />
        <SinglePaginationButtonSkeleton />
      </div>
    </div>
  )
}

function SingleColumnSkeleton() {
  return <Skeleton className='h-6 w-full bg-pulse dark:bg-secondary' />
}

function SinglePaginationButtonSkeleton() {
  return (
    <Skeleton className='h-5 rounded-full w-[40px] bg-pulse dark:bg-secondary' />
  )
}
