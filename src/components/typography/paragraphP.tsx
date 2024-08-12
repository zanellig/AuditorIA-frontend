import { cn } from "@/lib/utils"
import type React from "react"
export default function ParagraphP({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  )
}
