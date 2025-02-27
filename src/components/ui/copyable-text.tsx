"use client"

import * as React from "react"
import { useToast } from "@/components/ui/use-toast"
import { handleCopyToClipboard } from "@/lib/utils"
import { cn } from "@/lib/utils"

type TextColor = "muted" | "primary" | "default"
type TextSize = "xs" | "md" | "lg"

interface CopyableTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * The text to be displayed and copied
   */
  children: React.ReactNode
  /**
   * Optional toast title to show when text is copied
   */
  toastTitle?: string
  /**
   * Optional toast description to show when text is copied
   */
  toastDescription?: string
  /**
   * Color variant for the text
   * @default "muted"
   */
  color?: TextColor
  /**
   * Size variant for the text
   * @default "xs"
   */
  size?: TextSize
}

/**
 * A component that displays text and copies it to clipboard when clicked
 */
export function CopyableText({
  children,
  className,
  toastTitle = "Texto copiado",
  toastDescription,
  color = "muted",
  size = "xs",
  ...props
}: CopyableTextProps) {
  const { toast } = useToast()

  const handleClick = () => {
    const textContent =
      typeof children === "string"
        ? children
        : children instanceof Array
          ? children.join("")
          : String(children)

    handleCopyToClipboard(textContent)

    toast({
      title: toastTitle,
      description: toastDescription || textContent,
    })
  }

  return (
    <p
      className={cn(
        "truncate hover:underline underline-offset-2 hover:cursor-pointer",
        {
          "text-muted-foreground": color === "muted",
          "text-primary": color === "primary",
          "text-foreground": color === "default",
          "text-xs": size === "xs",
          "text-md": size === "md",
          "text-lg": size === "lg",
        },
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </p>
  )
}
