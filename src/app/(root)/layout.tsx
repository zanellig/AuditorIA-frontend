import type { ReactNode } from "react"
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import { CustomBorderCard } from "@/components/custom-border-card"
import { env } from "@/env"
import { Providers } from "@/components/context/Providers"
import { Toaster } from "@/components/ui/toaster"

export const dynamic = "force-dynamic"

const BACKGROUND = "bg-background"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Providers>
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
        <Toaster />
      </Providers>
    </>
  )
}
