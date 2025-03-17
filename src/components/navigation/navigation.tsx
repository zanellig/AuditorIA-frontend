"use client"
import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import {
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
  LayoutList,
  MailIcon,
  MenuIcon,
  MessageSquare,
  PieChart,
  Plug,
  Search,
  Server,
  Settings,
  TrendingUp,
  Upload,
  User,
  UsersIcon,
} from "lucide-react"
import { SendUsFeedbackButton } from "@/components/navigation/feedback-button"
import { BreadcrumbWithCustomSeparator } from "./breadcrumbs-with-separator"
import { AvatarButton } from "./avatar"
import { ModeToggle } from "./mode-toggle"
import { SidebarButton, SidebarButtonProps } from "./sidebar-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "../logo"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { TaskSearch } from "./task-search"
import { NotificationButton } from "../notifications/notification-button"
import { useNotificationEvents } from "@/lib/hooks/use-notifications"

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
const links = [
  {
    Icon: Home,
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    href: "/dashboard/all-tasks",
    title: "Todas las tareas",
    Icon: LayoutList,
  },
  {
    href: "/dashboard/upload",
    Icon: Upload,
    title: "Subir un archivo",
  },
  {
    href: "/dashboard/tasks",
    title: "Historial de tareas",
    Icon: History,
    disabled: false,
  },
  {
    title: "Buscar audios",
    Icon: Search,
    Achildren: [
      {
        href: "/dashboard/records/campaign",
        title: "Campañas",
        Icon: Headset,
      },
      {
        href: "/dashboard/records/operator",
        title: "Operador",
        Icon: User,
      },

      {
        href: "/dashboard/records/date",
        title: "Fecha",
        Icon: CalendarSearch,
      },
      {
        href: "/dashboard/records/direction",
        title: "Dirección",
        Icon: ArrowRightLeft,
      },
    ],
  },
  {
    href: "/dashboard/reports",
    Icon: FileChartColumn,
    title: "Reportes",
    disabled: true,
  },
  {
    href: "/dashboard/chats",
    Icon: MessageSquare,
    title: "Chats",
    disabled: true,
  },
  {
    href: "/dashboard/settings",
    Icon: Settings,
    title: "Configuración",
    disabled: true,
    Achildren: [
      {
        href: "/dashboard/settings/account",
        title: "Cuenta",
        Icon: User,
        disabled: true,
      },
      {
        href: "/dashboard/status",
        title: "Estado de los servicios",
        Icon: Server,
      },
      {
        href: "/dashboard/notifications",
        Icon: Bell,
        title: "Notificaciones",
        disabled: true,
      },
      {
        href: "/dashboard/activity-log",
        Icon: Clock,
        title: "Log de actividad",
        disabled: true,
      },
    ],
  },
  {
    href: "/dashboard/team-management",
    Icon: UsersIcon,
    title: "Administración de equipo",
    disabled: true,
    Achildren: [
      {
        href: "/dashboard/team-management/roles",
        title: "Roles & Permisos",
        Icon: KeyIcon,
        disabled: true,
      },
      {
        href: "/dashboard/team-management/invitations",
        title: "Invitaciones",
        Icon: MailIcon,
        disabled: true,
      },
    ],
  },
  {
    href: "/dashboard/integrations",
    Icon: Plug,
    title: "Integraciones",
    disabled: true,
  },
  {
    Icon: BarChart,
    title: "Analíticas",
    disabled: true,
    Achildren: [
      {
        href: "/dashboard/analytics/overview",
        title: "Vista general",
        Icon: PieChart,
        disabled: true,
      },
      {
        href: "/dashboard/analytics/performance",
        title: "Rendimiento",
        Icon: TrendingUp,
        disabled: true,
      },
    ],
  },
]

export function Sidebar({ className }: { className?: string }) {
  const memoizedLinks = React.useMemo(() => {
    return links.map((link, index) => (
      <SidebarButton
        customKey={"sidebar-button-" + index}
        key={"sidebar-button-" + index}
        href={link.href ?? "#"}
        Icon={link.Icon ?? <></>}
        title={link.title ?? ""}
        disabled={link.disabled ?? false}
        className='w-full'
      >
        {link.Achildren?.map((child, childIndex) => (
          <SidebarButton
            key={`sidebar-button-${index}-${childIndex}`}
            {...(child as SidebarButtonProps)}
          />
        ))}
      </SidebarButton>
    ))
  }, [])
  return (
    <ScrollArea
      className={cn(
        "hidden lg:flex flex-col space-y-0 p-0 h-dvh min-w-72 w-72 items-center justify-between text-muted-foreground",
        className
      )}
    >
      {/* App icon */}
      {/* The z index makes it so the sidebar is above the ScrollArea */}
      <Link
        href='/dashboard'
        className={cn(
          "flex space-x-4 p-4 mb-2 items-center sticky top-0 w-full backdrop-blur-sm border-b border-solid border-muted z-10",
          TOP_HEIGHT
        )}
      >
        <Logo width={16} height={16} />
        <p
          className='duration-300 transition-colors font-bold hover:animate-sparkle'
          style={{
            fontSize: "1.2rem",
          }}
        >
          AuditorIA
        </p>
      </Link>

      {memoizedLinks}
      <SendUsFeedbackButton className='mx-2 mb-2 pr-12'>
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
  useNotificationEvents()

  const memoizedDrawerContent = React.useMemo(
    () => (
      <DrawerContent className='max-h-[550px] h-dvh'>
        <DrawerHeader>
          <VisuallyHidden asChild>
            <DrawerTitle>Menú</DrawerTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <DrawerDescription>
              A través de este menú, podrá navegar por la aplicación.
            </DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        <ScrollArea>
          {links.map((link, index) => (
            <SidebarButton
              customKey={"sidebar-button-" + index}
              key={"sidebar-button-" + index}
              href={link.href ?? "#"}
              Icon={link.Icon ?? <></>}
              title={link.title ?? ""}
              disabled={link.disabled ?? false}
              className='w-full'
            >
              {link.Achildren?.map((child, childIndex) => (
                <SidebarButton
                  {...(child as SidebarButtonProps)}
                  key={`sidebar-button-${index}-${childIndex}`}
                />
              ))}
            </SidebarButton>
          ))}
          <SendUsFeedbackButton className='mx-2 mr-4 mb-2 w-full'>
            <div>Envianos tus comentarios</div>
          </SendUsFeedbackButton>
          <VisuallyHidden asChild>
            <DrawerClose id='menu-drawer-close-button' />
          </VisuallyHidden>
        </ScrollArea>
      </DrawerContent>
    ),
    []
  )

  return (
    <div
      className={cn(
        "sticky top-0 w-full p-4 flex flex-row justify-between items-center z-10 backdrop-blur-sm shadow-md dark:shadow-xl border-b border-solid border-muted",
        className,
        TOP_HEIGHT
      )}
      style={style}
    >
      <article className='lg:hidden block'>
        <Drawer>
          <DrawerTrigger asChild>
            <Button size='icon' variant={"outline"}>
              <MenuIcon size={GLOBAL_ICON_SIZE} />
            </Button>
          </DrawerTrigger>
          {memoizedDrawerContent}
          <VisuallyHidden asChild>
            <DrawerClose id='menu-drawer-close-trigger' />
          </VisuallyHidden>
        </Drawer>
      </article>
      <BreadcrumbWithCustomSeparator className='hidden lg:block' />
      <div className='flex flex-row gap-2 items-center justify-end'>
        {children}
        <TaskSearch />
        <AvatarButton />
        <NotificationButton />
        <div>
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
