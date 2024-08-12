"use client"
import React, { useState } from "react"
import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NavigationButtons, Sidebar } from "@/components/navigation/navigation"
import { ScrollProvider } from "@/components/ScrollProvider"

export default function Layout({
  children,
  recordings,
  tasks,
}: {
  children: ReactNode
  recordings: ReactNode
  tasks: ReactNode
}) {
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
            className='flex flex-row relative overflow-hidden'
          >
            <section id='main-sidebar-container' className=''>
              <Sidebar onResize={handleSidebarResize} />
            </section>
            <section
              id='main-app-container'
              style={{ width: `calc(100dvw - ${sidebarWidth}px)` }}
              className='transition-all duration-300'
            >
              <NavigationButtons
                style={{ width: `calc(100dvw - ${sidebarWidth}px)` }}
              />
              <div className='overflow-auto h-full'>
                {children}
                {tasks}
                {recordings}
              </div>
            </section>
          </div>
          <Toaster />
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
