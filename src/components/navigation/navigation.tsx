"use client"
import React from "react"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart,
  Bell,
  CalendarSearch,
  Clock,
  FileChartColumn,
  Headset,
  History,
  Home,
  KeyIcon,
  MailIcon,
  MessageSquare,
  PieChart,
  Plug,
  Server,
  Settings,
  TrendingUp,
  Upload,
  User,
  UsersIcon,
} from "lucide-react"
import { SendUsFeedbackButton } from "@/components/navigation/feedback-button"
import { useScroll } from "../context/ScrollProvider"
import { usePathname } from "next/navigation"
import { BreadcrumbWithCustomSeparator } from "./breadcrumbs-with-separator"
import { AvatarButton } from "./avatar"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import { TESTING, TESTING_RECORDINGS } from "@/lib/consts"
import StatusBadges from "./status.client"
import { SidebarButton, SidebarButtonProps } from "./sidebar-button"
import { ScrollArea } from "../ui/scroll-area"
import Image from "next/image"
import logo from "@/app/favicon.ico"

const iconSize = "h-[1.2rem] w-[1.2rem]"
const TOP_HEIGHT = "h-14"

/**
 * To add a new tab, add it to the links array below, maintaining the order in which you want it to appear.
 *
 * IMPORTANT: Remember to create a folder with the same name as the href you will be redirecting to and include a page.tsx file in that folder.
 *
 * IMPORTANT: Please don't rename the array to children, as it will conflict with the children prop.
 *
 * You can nest children infinitely by adding an "Achildren" key with an array of objects
 * following the same structure as the other objects in the array.
 *
 * If you provide an array of children, the button will be expandable.
 *
 * If you don't provide an href, the button will not redirect the user, but you can still use the onClick event.
 *
 * Haven't tested passing children to an expandable button, but it should work.
 *
 * The props are defined in sidebar-button.tsx as SidebarButtonProps. If you add keys to the object that are not declared in the interface,
 * the app will not crash, but the key will be ignored.
 *
 * Be careful when adding links without an icon, as the text will be offset and will not align with other buttons that have an icon.
 *
 */
export function Sidebar({ className }: { className?: string }) {
  const links = [
    {
      icon: <Home className={iconSize} />,
      title: "Dashboard",
      href: "/dashboard",
      clickOptions: {
        onClick: () => {},
      },
      Achildren: [
        {
          href: "/dashboard/tasks",
          title: "Historial",
          icon: <History className={iconSize} />,
          disabled: false,
        },
        {
          href: "/dashboard/records/campaign",
          title: "Campañas",
          icon: <Headset className={iconSize} />,
        },
        {
          href: "/dashboard/records/operator",
          title: "Operador",
          icon: <User className={iconSize} />,
        },
        {
          title: "Audios problemáticos",
          icon: <AlertTriangle className={iconSize} />,
          disabled: true,
        },
        {
          href: "/dashboard/records/date",
          title: "Fecha",
          icon: <CalendarSearch className={iconSize} />,
        },
        {
          href: "/dashboard/records/direction",
          title: "Dirección",
          icon: <ArrowRightLeft className={iconSize} />,
        },
      ],
    },
    {
      href: "/upload",
      icon: <Upload className={iconSize} />,
      title: "Subir un archivo",
    },
    {
      href: "/reportes",
      icon: <FileChartColumn className={iconSize} />,
      title: "Reportes",
    },
    {
      href: "/chats",
      icon: <MessageSquare className={iconSize} />,
      title: "Chats",
      disabled: true,
    },
    {
      href: "/settings",
      icon: <Settings className={iconSize} />,
      title: "Configuración",
      disabled: false,
      Achildren: [
        {
          href: "/settings/account",
          title: "Cuenta",
          icon: <User className={iconSize} />,
          disabled: true,
        },
        {
          href: "/status",
          title: "Estado de los servicios",
          icon: <Server className={iconSize} />,
        },
        {
          href: "/notifications",
          icon: <Bell className={iconSize} />,
          title: "Notificaciones",
          disabled: true,
        },
        {
          href: "/activity-log",
          icon: <Clock className={iconSize} />,
          title: "Log de actividad",
          disabled: false,
        },
      ],
    },
    {
      href: "/team-management",
      icon: <UsersIcon className={iconSize} />,
      title: "Administración de equipo",
      disabled: true,
      Achildren: [
        {
          href: "/team-management/roles",
          title: "Roles & Permisos",
          icon: <KeyIcon className={iconSize} />,
          disabled: true,
        },
        {
          href: "/team-management/invitations",
          title: "Invitaciones",
          icon: <MailIcon className={iconSize} />,
          disabled: true,
        },
      ],
    },
    {
      href: "/integrations",
      icon: <Plug className={iconSize} />,
      title: "Integraciones",
      disabled: true,
    },
    {
      icon: <BarChart className={iconSize} />,
      title: "Analíticas",
      disabled: true,
      Achildren: [
        {
          href: "/analytics/overview",
          title: "Vista general",
          icon: <PieChart className={iconSize} />,
          disabled: true,
        },
        {
          href: "/analytics/performance",
          title: "Rendimiento",
          icon: <TrendingUp className={iconSize} />,
          disabled: true,
        },
      ],
    },
  ]

  return (
    <ScrollArea
      className={cn(
        "flex flex-col space-y-0 w-fit p-0 h-dvh min-w-72 items-center justify-between text-muted-foreground",
        className
      )}
    >
      {/* App icon */}
      {/* The z index makes it so the sidebar is above the ScrollArea */}
      <Link
        href='/'
        className={cn(
          "flex space-x-4 p-4 mb-2 items-center sticky top-0 w-full backdrop-blur-sm border-b border-solid border-muted z-10",
          TOP_HEIGHT
        )}
      >
        <Image
          src={logo}
          alt='AuditorIA'
          loading='lazy'
          className='w-[1.2rem] h-[1.2rem]'
        />
        <p
          className='duration-300 transition-colors font-bold hover:text-foreground'
          style={{
            fontSize: "1.2rem",
          }}
        >
          AuditorIA
        </p>
      </Link>

      {links.map((link, index) => (
        <SidebarButton
          customKey={"sidebar-button-" + index}
          href={link.href}
          icon={link.icon}
          title={link.title}
          clickOptions={link.clickOptions}
          disabled={link.disabled ?? false}
          className='w-full'
        >
          {link.Achildren && link.Achildren.length > 0
            ? link.Achildren.map((child, childIndex) => (
                <SidebarButton {...(child as SidebarButtonProps)} />
              ))
            : null}
        </SidebarButton>
      ))}
      <SendUsFeedbackButton className='mx-2'>
        <div>Envianos tus comentarios</div>
      </SendUsFeedbackButton>
    </ScrollArea>
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
  const [showButtons, setShowButtons] = React.useState(false)
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
        "sticky top-0 w-full p-4 flex flex-row justify-between items-center z-10 backdrop-blur-sm shadow-md dark:shadow-xl border-b border-solid border-muted",
        className,
        TOP_HEIGHT
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
        {children}
        <AvatarButton showButtons={showButtons} />
        <div className={`transition-all duration-500 `}>
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
