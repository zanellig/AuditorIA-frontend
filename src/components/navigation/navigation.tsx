"use client"
import React, { Suspense, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BookmarkIcon,
  ChevronLeftIcon,
  DownloadIcon,
  FilePlusIcon,
  GearIcon,
  HamburgerMenuIcon,
  HomeIcon,
} from "@radix-ui/react-icons"
import { SendUsFeedbackButton } from "@/components/navigation/feedback-button"
import { useScroll } from "../ScrollProvider"
import { usePathname } from "next/navigation"
import { BreadcrumbWithCustomSeparator } from "./breadcrumbs-with-separator"
import { AvatarButton } from "./avatar"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import StatusBadges from "@/components/navigation/status.client"

export function Sidebar({
  className,
  onResize,
}: {
  className?: string
  onResize: (width: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  React.useEffect(() => {
    const width = isExpanded ? 256 : 64 // 16rem when expanded, 4rem when collapsed
    onResize(width)
  }, [isExpanded])

  return (
    <nav
      className={cn(
        "flex flex-col h-dvh items-center justify-between py-4 px-2 rounded-br-md space-y-4 transition-all duration-400 overflow-hidden text-muted-foreground bg-primary-foreground",
        isExpanded ? "w-64" : "w-16",
        className
      )}
    >
      <SidebarButtonWrapper onClick={toggleSidebar}>
        <div>
          <ChevronLeftIcon
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-all duration-600",
              !isExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </div>

        <div>Cerrar menú</div>
      </SidebarButtonWrapper>
      <div className='flex flex-col space-y-4 w-full'>
        <Link href='/dashboard'>
          <SidebarButtonWrapper>
            <div>
              <HomeIcon className='h-[1.2rem] w-[1.2rem]' />
            </div>

            <div>Dashboard</div>
          </SidebarButtonWrapper>
        </Link>
        <Link href='/subir-archivos'>
          {" "}
          <SidebarButtonWrapper>
            <div>
              <FilePlusIcon className='h-[1.2rem] w-[1.2rem]' />
            </div>

            <div>Subir un archivo</div>
          </SidebarButtonWrapper>
        </Link>
        <Link href='/tareas-guardadas'>
          <SidebarButtonWrapper>
            <div>
              <BookmarkIcon className='h-[1.2rem] w-[1.2rem]' />
            </div>

            <div>Tareas guardadas</div>
          </SidebarButtonWrapper>
        </Link>
        <Link href='/reportes'>
          <SidebarButtonWrapper>
            <div>
              <DownloadIcon className='h-[1.2rem] w-[1.2rem]' />
            </div>

            <div>Descargar reportes</div>
          </SidebarButtonWrapper>
        </Link>
      </div>
      <div className='flex flex-col space-y-4 w-full'>
        <SendUsFeedbackButton>
          <div>Envianos tus comentarios</div>
        </SendUsFeedbackButton>
        <Link href='/configuracion'>
          <SidebarButtonWrapper>
            <div>
              <GearIcon className='h-[1.2rem] w-[1.2rem]' />
            </div>
            <div>Configuración</div>
          </SidebarButtonWrapper>
        </Link>
      </div>
    </nav>
  )
}

function SidebarButtonWrapper({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Button
      variant={"ghost"}
      className={cn(
        "flex bg-popover w-full items-center justify-start space-x-4 overflow-hidden p-4",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function NavigationButtons({
  children,
  className,
  style,
}: {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { scrollY } = useScroll()
  const pathname = usePathname()
  // const router = useRouter()

  const [showButtons, setShowButtons] = useState(false)

  React.useEffect(() => {
    if (scrollY >= 0 && scrollY < 20) {
      setShowButtons(true)
    } else {
      setShowButtons(false)
    }
  }, [scrollY])

  return (
    <div
      className={cn(
        "sticky top-0 w-full h-fit p-4 flex flex-row justify-between items-center z-10 backdrop-blur-sm shadow-md",
        className
      )}
      style={style}
    >
      <BreadcrumbWithCustomSeparator />

      <div className='flex flex-row space-x-4 items-center'>
        {/* <Suspense fallback={<div>Loading...</div>}>
          <StatusBadges />
        </Suspense> */}
        <AvatarButton showButtons={showButtons} />
        <div className={`transition-all duration-500 `}>
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
