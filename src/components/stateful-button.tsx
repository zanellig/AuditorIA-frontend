"use client"
// 100% prompt engineered with v0.dev
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: React.ReactNode
}

const StatefulButton = React.forwardRef<HTMLButtonElement, StatefulButtonProps>(
  (
    { className, variant, size, icon, isLoading, children, disabled, ...props },
    ref
  ) => {
    return (
      <Button
        className={cn("relative", isLoading && "[&>span]:opacity-0", className)}
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        <span className='flex items-center justify-center transition-opacity duration-200'>
          {icon}
          <span className={cn("text-sm", icon && "ml-2")}>{children}</span>
        </span>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className='absolute inset-0 flex items-center justify-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className='h-5 w-5 animate-spin' />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    )
  }
)
StatefulButton.displayName = "StatefulButton"

export { StatefulButton }
