"use client"
import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollProvider } from "@/components/context/ScrollProvider"
import { TranscriptionProvider } from "@/components/context/TranscriptionProvider"
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const BACKGROUND = "bg-pulse"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProvider>
        <TooltipProvider>
          <TranscriptionProvider>
            {/* This one serves as the "body" tag so that we don't have to navigate to the root layout.tsx when we want to modify or check it. */}
            <div
              id='global-container'
              className={cn("flex relative bg-transparent w-dvw h-dvh")}
            >
              <Sidebar className={cn(BACKGROUND)} />
              <section
                id='main-container'
                className={cn(
                  BACKGROUND,
                  "border-s border-solid border-muted relative bg-primary-foreground w-full"
                )}
              >
                <ScrollArea className='max-h-dvh h-dvh min-h-dvh '>
                  <TopNavbar />
                  <div className='px-5 py-2 min-h-full'>
                    {children}
                    <Footer />
                  </div>
                </ScrollArea>
              </section>
            </div>
            <Toaster />
            <ReactQueryDevtools
              initialIsOpen={true}
              buttonPosition='top-left'
            />
          </TranscriptionProvider>
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
