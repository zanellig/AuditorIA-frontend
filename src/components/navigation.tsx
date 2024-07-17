"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "./ui/button"
import { ModeToggle } from "./ModeToggle"

import { useScroll } from "@/components/ScrollProvider"
import { ChevronLeft } from "lucide-react"
import { NAVIGATION_ICON_SIZE } from "@/lib/consts"

export default function NavigationButtons() {
  /**
   * TODO: dynamic render the back to dashboard button when NOT in dashboard
   *https://tasks.office.com/linksolution.com.ar/Home/Task/NJ_2S_7cj0qHo9Bzv0OyEWUAMyX3?Type=TaskLink&Channel=Link&CreatedTime=638566708070090000
   */

  /**
   *  TODO: mostrar botones IF scroll is top
   */

  const { scrollY } = useScroll()
  const pathname = usePathname()

  const [showButtons, setShowButtons] = useState(false)
  const [isDashboard, setIsDashboard] = useState(false)

  useEffect(() => {
    if (scrollY >= 0 && scrollY < 20) {
      setShowButtons(true)
    } else {
      setShowButtons(false)
    }
  }, [scrollY])

  useEffect(() => {
    // Check if the current route is the dashboard
    if (pathname === "/dashboard") {
      setIsDashboard(true)
    } else {
      setIsDashboard(false)
    }
  }, [pathname])

  return (
    <>
      <div
        className={`fixed top-0 left-0 p-4 transition-all duration-500 transform ${
          showButtons
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        {!isDashboard ? (
          <Link href='/dashboard'>
            <Button variant='outline' className='p-2 bg-popover'>
              <ChevronLeft size={NAVIGATION_ICON_SIZE} /> Volver al dashboard
            </Button>
          </Link>
        ) : null}
      </div>
      <div
        className={`fixed top-0 right-0 p-4  transition-all duration-500 transform ${
          showButtons
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <ModeToggle />
      </div>
    </>
  )
}
