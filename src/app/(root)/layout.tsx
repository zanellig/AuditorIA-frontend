import { type ReactNode } from "react"
import { TopNavbar, Sidebar } from "@/components/navigation/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Footer from "@/components/footer"
import { CustomBorderCard } from "@/components/custom-border-card"
import { env } from "@/env"
import { Providers } from "@/components/context/Providers"

const BACKGROUND = "bg-background"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Providers>
        <div
          id='global-container'
          className={cn(
            "flex relative bg-transparent w-dvw h-dvh overflow-hidden"
          )}
        >
          <Sidebar className={cn(BACKGROUND, "dark:bg-pulse")} />
          <section
            id='main-container'
            className={cn(
              BACKGROUND,
              "border-s border-solid border-muted dark:bg-primary-foreground w-full h-dvh"
            )}
          >
            <ScrollArea className='flex flex-col h-full'>
              <TopNavbar />
              <div className='px-5 py-2 flex flex-col gap-2 w-full min-h-dvh flex-grow'>
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
              <Footer className='sticky bottom-0' />
            </ScrollArea>
          </section>
        </div>
      </Providers>
    </>
  )
}
