"use client"
import React from "react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

// Define the card variants using cva
const cardVariants = cva(
  "border w-full h-full", // Base classes for the card
  {
    variants: {
      variant: {
        default: "border-muted-foreground text-muted-foreground",
        success: "border-success text-success bg-success/5",
        error: "border-error text-error bg-error/5",
        warning: "border-warning text-warning bg-warning/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CustomBorderCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, // Omit title prop
    VariantProps<typeof cardVariants> {
  className?: string
  children?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "success" | "error" | "warning" | "default"
  button?: React.ReactNode
  closeButton?: boolean
}

export const CustomBorderCard = React.forwardRef<
  HTMLDivElement,
  CustomBorderCardProps
>(
  (
    {
      className,
      children,
      title,
      description,
      variant = "default",
      button,
      closeButton,
      ...props
    },
    ref
  ) => {
    // Get the variant classes from the cva function
    const variantClasses = cardVariants({ variant })
    const text = variantClasses.match(/text-\S+/)?.[0] || ""
    const [visible, setVisible] = React.useState(true)
    const closeCard = () => {
      setVisible(false)
    }

    return (
      <Card
        ref={ref}
        className={cn(variantClasses, className, !visible && "hidden")}
        {...props}
      >
        <CardHeader className='py-2 px-4'>
          {title && (
            <CardTitle
              className={cn(
                text,
                closeButton && "flex items-center justify-between"
              )}
            >
              {title}
              {closeButton && (
                <Button
                  onClick={closeCard}
                  size={"icon"}
                  variant={"ghost"}
                  className='p-1 rounded-full w-fit h-fit'
                >
                  <X size={GLOBAL_ICON_SIZE} />
                </Button>
              )}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(text)}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        {button && <CardFooter>{button}</CardFooter>}
      </Card>
    )
  }
)

CustomBorderCard.displayName = "CustomBorderCard"
