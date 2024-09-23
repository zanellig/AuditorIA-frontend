"use client"
import React, { Suspense, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BookmarkIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  FileIcon,
  GearIcon,
  HomeIcon,
  UploadIcon,
} from "@radix-ui/react-icons"
import { SendUsFeedbackButton } from "@/components/navigation/feedback-button"
import { useScroll } from "../context/ScrollProvider"
import { usePathname } from "next/navigation"
import { BreadcrumbWithCustomSeparator } from "./breadcrumbs-with-separator"
import { AvatarButton } from "./avatar"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import { TESTING, TESTING_RECORDINGS } from "@/lib/consts"
import StatusBadges from "./status.client"

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
  // to add a new tab, add it to the links array below respecting the order in which you want it to appear :)
  // remember to add the folder with the href name you will be redirecting to and the page.tsx file said folder (basic nextjs app router behaviour)
  const links = [
    {
      icon: (
        <ChevronLeftIcon
          className={cn(
            "h-[1.2rem] w-[1.2rem] transition-all duration-600",
            !isExpanded ? "rotate-0" : "rotate-180"
          )}
        />
      ),
      title: "Cerrar menú",
      clickOptions: {
        onClick: toggleSidebar,
      },
    },
    {
      href: "/dashboard",
      icon: <HomeIcon className='h-[1.2rem] w-[1.2rem]' />,
      title: "Dashboard",
    },
    {
      href: "/upload",
      icon: <UploadIcon className='h-[1.2rem] w-[1.2rem]' />,
      title: "Subir un archivo",
    },
    {
      href: "/reportes",
      icon: <FileIcon className='h-[1.2rem] w-[1.2rem]' />,
      title: "Reportes",
    },
    {
      href: "/chats",
      icon: <ChatBubbleIcon className='h-[1.2rem] w-[1.2rem]' />,
      title: "Chats",
      disabled: true,
    },
    {
      href: "/settings",
      icon: <GearIcon className='h-[1.2rem] w-[1.2rem]' />,
      title: "Configuración",
    },
  ]

  React.useEffect(() => {
    const width = isExpanded ? 256 : 64 // 16rem when expanded, 4rem when collapsed
    onResize(width)
  }, [isExpanded])

  return (
    <nav
      className={cn(
        "flex flex-col h-dvh items-center justify-between py-4 px-2 rounded-br-md space-y-4  overflow-hidden text-muted-foreground bg-primary-foreground",
        className
      )}
    >
      <div className='flex flex-col space-y-4 w-full'>
        {links.map((link, index) => {
          return (
            <SidebarButton
              buttonKey={"sidebar-button-" + index}
              href={link.href}
              icon={link.icon}
              title={link.title}
              clickOptions={link.clickOptions}
              disabled={link.disabled}
            />
          )
        })}
      </div>
      <SendUsFeedbackButton>
        <div>Envianos tus comentarios</div>
      </SendUsFeedbackButton>
    </nav>
  )
}
function SidebarButton({
  children,
  className,
  buttonKey,
  href,
  icon,
  title,
  clickOptions,
  disabled = false,
}: {
  children?: React.ReactNode
  className?: string
  buttonKey: string
  href?: string
  icon: React.JSX.Element
  title: string
  clickOptions?: {
    redirect?: boolean
    onClick?: () => void
  }
  disabled?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  const selectedClassAtributes =
    "text-accent-foreground shadow-md shadow-accent-foreground/50 dark:shadow-accent-foreground/80 dark:bg-accent"
  return (
    <div className={cn(className)} key={buttonKey}>
      {!disabled && href ? (
        <Link href={href} key={buttonKey + "-link"}>
          <SidebarButtonWrapper
            className={isActive && selectedClassAtributes}
            wrapperKey={buttonKey + "-wrapper"}
          >
            <div key={buttonKey + "-icon"}>{icon}</div>
            <div key={buttonKey + "-title"} className='text-sm'>
              {title}
            </div>
          </SidebarButtonWrapper>
        </Link>
      ) : (
        <SidebarButtonWrapper
          onClick={clickOptions?.onClick}
          className={isActive && selectedClassAtributes}
          wrapperKey={buttonKey + "-wrapper"}
          disabled={disabled}
        >
          <div key={buttonKey + "-icon"}>{icon}</div>
          <div key={buttonKey + "-title"} className='text-sm'>
            {title}
          </div>
        </SidebarButtonWrapper>
      )}
    </div>
  )
}
function SidebarButtonWrapper({
  children,
  className,
  wrapperKey,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  className?: string | boolean
  wrapperKey: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <div className='relative' key={wrapperKey}>
      <Button
        variant={"ghost"}
        className={cn(
          "flex bg-popover w-full items-center justify-start space-x-4 overflow-hidden p-4",
          className,
          disabled && "cursor-not-allowed hover:bg-background hover:shadow-none"
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </div>
  )
}

export function TopNavbar({
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
  const isSettingsPage = pathname.includes("/settings")

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
        "sticky top-0 w-full h-fit p-4 flex flex-row justify-between items-center z-10 backdrop-blur-sm shadow-md dark:shadow-xl rounded-md",
        className
      )}
      style={style}
    >
      <BreadcrumbWithCustomSeparator />
      <>
        {TESTING && (
          <p className='animate-pulse text-destructive'>TESTING IS ON</p>
        )}
        {TESTING_RECORDINGS && (
          <p className='animate-pulse text-destructive'>
            TESTING RECORDINGS IS ON
          </p>
        )}
      </>
      <div className='flex flex-row space-x-4 items-center'>
        {isSettingsPage && <StatusBadges />}
        {children}
        <AvatarButton showButtons={showButtons} />
        <div className={`transition-all duration-500 `}>
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
