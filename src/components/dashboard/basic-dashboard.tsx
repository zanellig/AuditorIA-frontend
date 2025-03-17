"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { StatefulButton } from "@/components/stateful-button"
import {
  ArrowRight,
  ArrowRightLeft,
  CalendarSearch,
  FileChartColumn,
  Headset,
  History,
  LayoutList,
  MessageSquare,
  Upload,
  User,
} from "lucide-react"
import { usePostHog } from "posthog-js/react"
import { useUser } from "../context/UserProvider"
import { useRouter } from "next/navigation"

const ButtonArrow = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <ArrowRight
    ref={ref}
    className={cn(className)}
    size={GLOBAL_ICON_SIZE}
    {...props}
  />
))

ButtonArrow.displayName = "ButtonArrow"

export default function BasicDashboard() {
  const posthog = usePostHog()
  const { username, userEmail, userFullName } = useUser()
  React.useEffect(() => {
    posthog?.identify(undefined, {
      email: userEmail,
      full_name: userFullName,
      username,
    })
  }, [username, userEmail, userFullName])

  const dashboardItems = [
    {
      title: "Subir archivos",
      icon: <Upload className={DASHBOARD_ICON_CLASSES} />,
      description:
        "En este módulo, podrá subir audios de manera manual y enviarlos al sistema de procesamiento.",
      href: "/dashboard/upload",
    },
    {
      title: "Ver todas las tareas",
      icon: <LayoutList className={DASHBOARD_ICON_CLASSES} />,
      description:
        "En este módulo, podrá ver y revisar los audios marcados como problemáticos.",
      href: "/dashboard/all-tasks",
      disabled: false,
    },
    {
      title: "Ver tu historial",
      icon: <History className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver su historial de transcripciones.",
      href: "/dashboard/tasks",
      disabled: false,
    },
    {
      title: "Buscar por campaña",
      icon: <Headset className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por campaña.",
      href: "/dashboard/records/campaign",
    },
    {
      title: "Buscar por operador",
      icon: <User className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por operador.",
      href: "/dashboard/records/operator",
    },
    {
      title: "Buscar por fecha",
      icon: <CalendarSearch className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por fecha.",
      href: "/dashboard/records/date",
    },
    {
      title: "Buscar por dirección",
      icon: <ArrowRightLeft className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por dirección.",
      href: "/dashboard/records/direction",
    },
    {
      title: "Ver reportes",
      icon: <FileChartColumn className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los reportes.",
      // href: "/dashboard/reports",
      disabled: true,
    },
    {
      title: "Ver chats",
      icon: <MessageSquare className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver y analizar los chats.",
      href: "/dashboard/chats",
      disabled: true,
    },
  ]

  const router = useRouter()

  return (
    <>
      <main
        id='basic-dashboard'
        className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full'
        style={{ userSelect: "none" }}
      >
        {dashboardItems.map((dashboardItem, index) => {
          const [isRedirecting, setIsRedirecting] =
            React.useState<boolean>(false)

          const ButtonContent = React.memo(() => {
            return (
              <div className='flex items-center justify-center space-x-2'>
                <span>{<ArrowRight size={GLOBAL_ICON_SIZE} />}</span>
                <span>{"Ir a " + dashboardItem.title.toLowerCase()}</span>
              </div>
            )
          })

          if (!dashboardItem.disabled && !dashboardItem.href) {
            throw new Error(
              "Invalid dashboard item. An href must be specified for non-disabled items."
            )
            return null
          }

          return (
            <div className='border border-muted bg-popover rounded-xl p-4 min-h-40'>
              <div className='flex flex-col gap-4 justify-between h-full'>
                <div className='flex flex-col gap-2'>
                  <span>{dashboardItem.icon}</span>
                  <h1 className='font-semibold'>{dashboardItem.title}</h1>
                  <p className='text-sm text-muted-foreground'>
                    {dashboardItem.description}
                  </p>
                </div>
                <StatefulButton
                  isLoading={isRedirecting}
                  onClick={() => {
                    setIsRedirecting(true)
                    router.push(dashboardItem.href!)
                  }}
                  disabled={dashboardItem.disabled}
                >
                  <ButtonContent />
                </StatefulButton>
              </div>
            </div>
          )
        })}
      </main>
    </>
  )
}
