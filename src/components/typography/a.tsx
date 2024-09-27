// forward component
// define props
// define component

import { cn } from "@/lib/utils"
import React from "react"

export default React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "font-medium text-primary underline underline-offset-4",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
})
