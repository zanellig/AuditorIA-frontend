import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export default function TitleContainer({
  children,
  className,
  separate,
}: {
  children: React.ReactNode
  className?: string
  separate?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={"flex flex-col w-full space-x-2"}>
      <div
        className={cn(
          "flex flex-row space-x-2 items-center justify-start w-full min-w-full p-0 m-0",
          className
        )}
      >
        {children}
      </div>
      {separate && <Separator className='mt-2' />}
    </main>
  )
}
