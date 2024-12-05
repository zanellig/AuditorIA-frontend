"use client"
// 100% prompt engineered with v0.dev
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader } from "lucide-react"
import {
  Button,
  buttonVariants,
  type ButtonProps,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  icon?: React.ReactNode
}

const StatefulButton = React.forwardRef<
  HTMLButtonElement,
  StatefulButtonProps & ButtonProps
>(({ className, icon, isLoading, children, disabled, ...props }, ref) => {
  return (
    <Button
      className={cn(
        "relative w-full",
        isLoading && "[&>span]:opacity-0",
        className
      )}
      disabled={isLoading || disabled}
      ref={ref}
      {...props}
    >
      <motion.span
        className='absolute inset-0 flex items-center justify-center gap-2 text-sm'
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: isLoading ? -20 : 0, opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon && icon}
        {children}
      </motion.span>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className='absolute inset-0 flex items-center justify-center space-x-2'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader className='h-5 w-5 animate-spin' />
            <span>Cargando...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
})
StatefulButton.displayName = "StatefulButton"

export { StatefulButton }
