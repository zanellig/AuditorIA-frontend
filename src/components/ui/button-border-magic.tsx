"use client"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

// async function analyze (id: Task['identifier']) {
//   const res =
// }

export default function ButtonBorderMagic({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  id?: Task["identifier"]
  onClick?: () => void
}) {
  return (
    <button
      className={cn(
        "relative inline-flex overflow-hidden h-12 rounded-md p-[1px] focus:outline-none focus:ring-0 ",
        className
      )}
      onClick={onClick}
    >
      <span
        className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]
      bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]
      '
      />
      <span className='inline-flex h-full w-full cursor-default items-center justify-start rounded-md dark:bg-slate-950 bg-slate-50 hover:bg-slate-200 transition-colors duration-300 dark:hover:bg-slate-800 px-2 py-1 text-sm font-bold backdrop-blur-3xl'>
        {children}
      </span>
    </button>
  )
}
