import React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
export default function TableContainer({
  children,
  className,
  separate = false,
}: {
  children: React.ReactNode
  className?: string
  separate?: boolean
}) {
  return (
    <div
      className={cn(
        "container m-0 flex flex-col w-full h-full px-2 min-w-full",
        className
      )}
    >
      {children}
      {separate && <Separator className='my-4' />}
    </div>
  )
}
