import React from "react"
import { cn } from "@/lib/utils"
export default function TableContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "container m-0 flex flex-col w-full h-full px-2 pt-4 max-w-[1440px]",
        className
      )}
    >
      {children}
    </div>
  )
}
