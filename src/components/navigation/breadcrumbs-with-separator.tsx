import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

export function BreadcrumbWithCustomSeparator({
  className,
}: {
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const pathnames = pathname.split("/").slice(1)
  React.useEffect(() => {
    router.prefetch(pathnames[0])
  }, [])

  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList>
        {pathnames.map((pathname, index) => {
          // last index is the current page
          if (index === pathnames.length - 1) {
            return (
              <div key={`${index}-${pathname}-item`}>
                <BreadcrumbItem className='bg-transparent'>
                  <BreadcrumbPage className='capitalize'>
                    {pathname}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </div>
            )
          } else {
            return (
              <div
                key={`${index}-${pathname}-item`}
                className='flex flex-row items-center space-x-2'
              >
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/${pathnames.slice(0, index + 1).join("/")}`}
                    className='capitalize'
                    key={`${index}-${pathname}-link`}
                  >
                    {pathname}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.length - 1 !== index && <BreadcrumbSeparator />}
              </div>
            )
          }
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
