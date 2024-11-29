import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { capitalizeOnlyFirstLetter, cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function BreadcrumbWithCustomSeparator({
  className,
}: {
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const pathnames = pathname.split("/").filter(Boolean)
  React.useEffect(() => {
    pathnames.forEach((path, index) => {
      const pathToPrefetch = `/${pathnames.slice(0, index + 1).join("/")}`
      router.prefetch(pathToPrefetch)
    })
  }, [pathnames, router])

  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList>
        {pathnames.map((pathname, index) => {
          const normalizedPathname = pathname.replace(/-/g, " ")
          const displayName = capitalizeOnlyFirstLetter(normalizedPathname)
          // last index is the current page
          if (index === pathnames.length - 1) {
            return (
              <BreadcrumbItem
                className='bg-transparent'
                key={`breadcrumb-${index}`}
              >
                <BreadcrumbPage>{displayName}</BreadcrumbPage>
              </BreadcrumbItem>
            )
          } else {
            return (
              <div
                key={`breadcrumb-${index}`}
                className='flex flex-row items-center space-x-2'
              >
                <BreadcrumbItem>
                  <Link
                    href={`/${pathnames.slice(0, index + 1).join("/")}`}
                    key={`${index}-${pathname}-link`}
                  >
                    {displayName}
                  </Link>
                </BreadcrumbItem>
                {pathnames.length - 1 !== index && (
                  <BreadcrumbSeparator aria-hidden='true' />
                )}
              </div>
            )
          }
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
