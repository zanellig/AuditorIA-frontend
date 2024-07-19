"use client"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <>
      <div className='flex flex-col space-y-10'>
        <Skeleton className='h-8 rounded-xl w-[300px] bg-secondary' />
        <div className='flex flex-col space-y-10'>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
          <PaginationSkeleton />
        </div>
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
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className='flex justify-end flex-row space-x-5'>
      <SinglePaginationButtonSkeleton />
      <SinglePaginationButtonSkeleton />
      <SinglePaginationButtonSkeleton />
    </div>
  )
}

function SingleColumnSkeleton() {
  return <Skeleton className='h-6 w-full bg-secondary' />
}

function SinglePaginationButtonSkeleton() {
  return <Skeleton className='h-5 rounded-full w-[40px] bg-secondary' />
}
