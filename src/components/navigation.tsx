"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "./ui/button"
import { ModeToggle } from "./ModeToggle"

import { useScroll } from "@/components/ScrollProvider"
import { ChevronLeft } from "lucide-react"
import { NAVIGATION_ICON_SIZE } from "@/lib/consts"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

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
    <div>
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
      <div className='flex flex-row fixed top-0 right-0 p-4 space-x-4'>
        <Avatar
          className={`transition-all duration-500 ${
            showButtons ? "translate-x-0" : "translate-x-12"
          }`}
        >
          {/* aca le pueden poner su avatar de github (o cualquier imagen que quieran), si lo cambian asegúrense de no meter este archivo en el commit */}
          <AvatarImage src='https://github.com/zanellig.png' />{" "}
          <AvatarFallback>GZ</AvatarFallback>
        </Avatar>
        <div
          className={`transition-all duration-500 transform ${
            showButtons
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
