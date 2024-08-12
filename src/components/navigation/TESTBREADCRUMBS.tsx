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
              <>
                <BreadcrumbItem key={pathname}>
                  <BreadcrumbPage
                    className='capitalize'
                    key={pathname + "-page"}
                  >
                    {pathname}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )
          } else {
            return (
              <>
                <BreadcrumbItem key={pathname}>
                  <BreadcrumbLink
                    href={`/${pathnames.slice(0, index + 1).join("/")}`}
                    className='capitalize'
                    key={pathname + "-link"}
                  >
                    {pathname}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.length - 1 !== index && <BreadcrumbSeparator />}
              </>
            )
          }
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
