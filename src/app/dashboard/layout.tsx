import NavigationButtons from "@/components/navigation"
import { ScrollProvider } from "@/components/ScrollProvider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProvider>
        <div id='main' className='flex flex-col mt-10'>
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
