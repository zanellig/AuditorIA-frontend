import type { ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollProvider } from "@/components/context/ScrollProvider"
import { TranscriptionProvider } from "@/components/context/TranscriptionProvider"
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { CustomBorderCard } from "@/components/custom-border-card"
import { env } from "@/env"

const BACKGROUND = "bg-background"

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
              <Sidebar className={cn(BACKGROUND, "dark:bg-pulse")} />
              <section
                id='main-container'
                className={cn(
                  BACKGROUND,
                  "border-s border-solid border-muted relative dark:bg-primary-foreground w-full h-dvh"
                )}
              >
                <ScrollArea className='flex flex-col relative h-full'>
                  <TopNavbar />
                  <div className='px-5 py-2 min-h-full h-full flex flex-col gap-2 w-full flex-grow'>
                    {env.NODE_ENV === "development" && (
                      <CustomBorderCard
                        title={"¡Advertencia!"}
                        description={
                          "Este es un entorno de pruebas. La aplicación no funcionará como usted lo espera."
                        }
                        variant='warning'
                        closeButton
                      />
                    )}
                    {children}
                  </div>
                  <Footer className='mt-auto' />
                </ScrollArea>
              </section>
            </div>
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
