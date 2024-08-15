"use client"
import React, { useState } from "react"
import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NavigationButtons, Sidebar } from "@/components/navigation/navigation"
import { ScrollProvider } from "@/components/ScrollProvider"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const BACKGROUND = "bg-pulse"

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(64) // Initial width of 16 (4rem)

  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width)
  }

  return (
    <>
      <ScrollProvider>
        <TooltipProvider>
          <div
            id='main-global-container'
            className={cn("flex flex-row relative overflow-hidden", BACKGROUND)}
          >
            <section
              id='main-sidebar-container'
              className={cn(
                "transition-all duration-300",
                sidebarWidth === 64 ? "w-64" : "w-16"
              )}
            >
              <Sidebar className={BACKGROUND} onResize={handleSidebarResize} />
            </section>
            <section
              id='main-app-container'
              // style={{ width: `calc(100dvw - ${sidebarWidth}px)` }}
              className='transition-all duration-300 border-s-2 border-solid border-muted rounded-s-xl overflow-hidden relative bg-primary-foreground w-full'
            >
              <ScrollArea className='max-h-dvh h-dvh'>
                <NavigationButtons />
                {children}
              </ScrollArea>
            </section>
          </div>
          <Toaster />
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
