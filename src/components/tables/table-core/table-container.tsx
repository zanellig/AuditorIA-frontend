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
    <div className={cn("m-0 flex flex-col p-0", className)}>
      {children}
      {separate && <Separator className='my-4' />}
    </div>
  )
}
