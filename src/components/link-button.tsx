import * as React from "react"
import Link from "next/link"
import { type VariantProps } from "class-variance-authority"

import {
  Button,
  type ButtonIconProps,
  type ButtonProps,
  buttonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  _?: string
}

const LinkButton = React.forwardRef<
  HTMLAnchorElement,
  LinkButtonProps & ButtonProps & ButtonIconProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <Link
      className={cn(className)}
      href={props.href ? props.href : "#"}
      ref={ref}
      {...props}
    >
      <Button
        className={cn(buttonVariants({ variant, size }))}
        size={size}
        asChild={props.asChild}
      >
        {props.children}
      </Button>
    </Link>
  )
})

LinkButton.displayName = "LinkButton"

export { LinkButton }
