import { cn } from "@/lib/utils"

export function TypographyH4({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        "scroll-m-20 sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h4>
  )
}
