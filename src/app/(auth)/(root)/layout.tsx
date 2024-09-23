"use client"
import React, { useState } from "react"
import type { ReactNode } from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollProvider } from "@/components/context/ScrollProvider"
import { DashboardProvider } from "@/components/context/DashboardProvider"
import { TranscriptionProvider } from "@/components/context/TranscriptionProvider"
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import DashboardSwitch from "@/components/dashboard/dashboard-switch"

const BACKGROUND = "bg-pulse"

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(16) // Initial width of 16 (4rem)
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width)
  }

  return (
    <>
      <ScrollProvider>
        <TooltipProvider>
          <DashboardProvider>
            <TranscriptionProvider>
              <div
                id='global-container'
                className={cn("flex relative overflow-hidden bg-transparent")}
              >
                <section
                  id='sidebar-container'
                  className={cn(
                    "transition-all duration-300",
                    sidebarWidth === 64 ? "w-64" : "w-16"
                  )}
                >
                  <Sidebar
                    className={BACKGROUND}
                    onResize={handleSidebarResize}
                  />
                </section>
                <section
                  id='main-container'
                  className={cn(
                    BACKGROUND,
                    "transition-all duration-300 border-s-2 border-solid border-muted rounded-tl-xl rounded-bl-xl overflow-hidden relative bg-primary-foreground w-full"
                  )}
                >
                  <ScrollArea className='max-h-dvh h-dvh'>
                    <TopNavbar>
                      <DashboardSwitch />
                    </TopNavbar>
                    <div className='px-5 py-2 min-h-full'>
                      {children}
                      <Footer />
                    </div>
                  </ScrollArea>
                </section>
              </div>
              <Toaster />
              <ReactQueryDevtools initialIsOpen={true} />
            </TranscriptionProvider>
          </DashboardProvider>
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
