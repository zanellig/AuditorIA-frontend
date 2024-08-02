import React from "react"
import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import EnvioDeTareas from "@/components/envio-de-tareas"
import NavigationButtons from "@/components/navigation"
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
  return (
    <>
      <ScrollProvider>
        <TooltipProvider>
          <div id='main' className='mt-10 w-full h-full overflow-x-hidden'>
            <NavigationButtons />
            <EnvioDeTareas />
            <div className='flex flex-col w-full h-full p-2'>
              {children}
              {tasks}
              {recordings}
            </div>
            <Toaster />
          </div>
        </TooltipProvider>
      </ScrollProvider>
    </>
  )
}
