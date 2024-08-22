"use client"
import React, { useState } from "react"
import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollProvider } from "@/components/ScrollProvider"
import { DashboardProvider } from "@/components/DashboardProvider" // <-- Import the provider
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import DashboardSwitch from "@/components/dashboard/dashboard-switch"

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
          <DashboardProvider>
            {/* TODO: acá va a ir el AudioPlayerProvider */}
            <div
              id='main-global-container'
              className={cn(
                "flex flex-row relative overflow-hidden bg-transparent"
              )}
            >
              <section
                id='main-sidebar-container'
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
                id='main-app-container'
                // style={{ width: `calc(100dvw - ${sidebarWidth}px)` }}
                className='transition-all duration-300 border-s-2 border-solid border-muted rounded-s-xl overflow-hidden relative bg-primary-foreground w-full'
              >
                <ScrollArea className='max-h-dvh h-dvh overflow-x-hidden'>
                  <TopNavbar>
                    <DashboardSwitch />
                  </TopNavbar>
                  {children}
                  <Footer />
                </ScrollArea>
              </section>
            </div>
            <Toaster />
          </DashboardProvider>
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
