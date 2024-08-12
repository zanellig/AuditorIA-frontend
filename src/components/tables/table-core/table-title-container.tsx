import { cn } from "@/lib/utils"

export default function TableTitleContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-row space-x-2 items-center justify-start w-fit",
        className
      )}
    >
      {children}
    </div>
  )
}
