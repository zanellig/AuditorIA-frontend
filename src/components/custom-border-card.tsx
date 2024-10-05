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

// Define the props for the CustomBorderCard
export interface CustomBorderCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  className?: string
  title?: string
  description?: string
  variant?: "success" | "error" | "warning" | "default"
  buttonText?: string
  onClick?: () => void
}

export const CustomBorderCard = React.forwardRef<
  HTMLDivElement,
  CustomBorderCardProps
>(
  (
    {
      className,
      title,
      description,
      variant = "default",
      buttonText,
      onClick,
      ...props
    },
    ref
  ) => {
    // Get the variant classes from the cva function
    const variantClasses = cardVariants({ variant })
    const text = variantClasses.match(/text-\S+/)?.[0] || ""

    return (
      <Card ref={ref} className={cn(variantClasses, className)} {...props}>
        <CardHeader className='py-2 px-4'>
          {title && <CardTitle className={cn(text)}>{title}</CardTitle>}
          {description && (
            <CardDescription className={cn(text)}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        {buttonText && (
          <CardFooter>
            <Button onClick={onClick}>{buttonText}</Button>
          </CardFooter>
        )}
      </Card>
    )
  }
)

CustomBorderCard.displayName = "CustomBorderCard"
