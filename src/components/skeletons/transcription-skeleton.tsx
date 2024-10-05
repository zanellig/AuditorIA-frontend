import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function TranscriptionSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <>
      <div
        className={cn("flex flex-col space-y-2 py-10 pl-4 pr-16", className)}
        // TODO: check this padding
      >
        <ChatSectionSkeletonContainer position='right'>
          <Skeleton className='h-[50px] rounded-xl w-[700px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='left'>
          <Skeleton className='h-[50px] rounded-xl w-[500px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='right'>
          <Skeleton className='h-[150px] rounded-xl w-[700px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='left'>
          <Skeleton className='h-[50px] rounded-xl w-[350px] bg-pulse dark:bg-secondary' />
          <Skeleton className='h-[50px] rounded-xl w-[500px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='right'>
          <Skeleton className='h-[50px] rounded-xl w-[350px] bg-pulse dark:bg-secondary' />
          <Skeleton className='h-[50px] rounded-xl w-[500px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='left'>
          <Skeleton className='h-[150px] rounded-xl w-[700px] bg-pulse dark:bg-secondary' />
          <Skeleton className='h-[50px] rounded-xl w-[500px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
        <ChatSectionSkeletonContainer position='right'>
          <Skeleton className='h-[50px] rounded-xl w-[150px] bg-pulse dark:bg-secondary' />
        </ChatSectionSkeletonContainer>
      </div>
    </>
  )
}
export function ChatSectionSkeletonContainer({
  position,
  children,
  className,
}: {
  position?: string
  children: React.ReactNode
  className?: string
}) {
  const RIGHT = "right"
  const LEFT = "left"
  return (
    <div
      className={cn(
        "flex flex-row space-x-2",
        className,
        position === RIGHT ? "self-end" : ""
      )}
    >
      {position === LEFT ? <AvatarSkeleton /> : null}
      <div
        className={cn(
          "flex flex-col space-y-2",
          position === RIGHT ? "items-end" : "items-start"
        )}
      >
        {children}
      </div>
      {position === RIGHT ? <AvatarSkeleton /> : null}
    </div>
  )
}
export function AvatarSkeleton() {
  return (
    <Skeleton className='h-[50px] w-[50px] rounded-full bg-pulse dark:bg-secondary' />
  )
}
