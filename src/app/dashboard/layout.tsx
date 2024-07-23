import NavigationButtons from "@/components/navigation"
import { ScrollProvider } from "@/components/ScrollProvider"
import React from "react"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProvider>
        <div id='main' className='mt-10 w-full h-full'>
          <NavigationButtons />
          {children}
        </div>
      </ScrollProvider>
    </>
  )
}

/**
 * TODO: add breadcrumbs for navigation
 * https://ui.shadcn.com/docs/components/breadcrumb
 */
