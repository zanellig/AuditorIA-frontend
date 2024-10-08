import React from "react"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { StatefulButton } from "@/components/stateful-button"
import {
  ArrowRight,
  ArrowRightLeft,
  Calendar,
  File,
  Headset,
  History,
  MessageSquare,
  TriangleAlert,
  Upload,
  User,
} from "lucide-react"

const ButtonArrow = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => (
  <ArrowRight
    ref={ref}
    className={cn(DASHBOARD_ICON_CLASSES, "text-foreground")}
    {...props}
  />
))

ButtonArrow.displayName = "ButtonArrow"

export default function BasicDashboard() {
  const dashboardItems = [
    {
      title: "Subir archivos",
      icon: <Upload className={DASHBOARD_ICON_CLASSES} />,
      description:
        "En este módulo, podrá subir audios de manera manual y enviarlos al sistema de procesamiento.",
      href: "/upload",
    },

    {
      title: "Ver tu historial",
      icon: <History className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver su historial de transcripciones.",
      href: "/dashboard/search/tasks",
    },
    {
      title: "Buscar por campaña",
      icon: <Headset className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por campaña.",
      href: "/dashboard/search/records/campaign",
    },
    {
      title: "Buscar por operador",
      icon: <User className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por operador.",
      href: "/dashboard/search/records/operator",
    },
    {
      title: "Ver audios problemáticos",
      icon: <TriangleAlert className={DASHBOARD_ICON_CLASSES} />,
      description:
        "En este módulo, podrá ver y revisar los audios marcados como problemáticos.",
      href: "/dashboard/search/tasks/ponderation",
      disabled: true,
    },
    {
      title: "Buscar por fecha",
      icon: <Calendar className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por fecha.",
      href: "/dashboard/search/records/date",
    },
    {
      title: "Buscar por dirección",
      icon: <ArrowRightLeft className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por dirección.",
      href: "/dashboard/search/records/direction",
    },
    {
      title: "Ver reportes",
      icon: <File className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los reportes.",
      href: "/reportes",
    },
    {
      title: "Ver chats",
      icon: <MessageSquare className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver y analizar los chats.",
      href: "/chats",
      disabled: true,
    },
  ]
  return (
    <>
      <main
        id='basic-dashboard'
        className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full justify-items-center relative '
        style={{ userSelect: "none" }}
      >
        {dashboardItems.map((dashboardItem, index) => (
          <Card3D
            title={dashboardItem.title}
            description={dashboardItem.description}
            icon={dashboardItem.icon}
            buttonIcon={<ArrowRight className={cn(DASHBOARD_ICON_CLASSES)} />}
            href={dashboardItem.href}
            disabled={dashboardItem.disabled}
            key={`${dashboardItem}-${index}-card`}
          />
        ))}
      </main>
    </>
  )
}

function Card3D({
  title,
  description,
  icon,
  buttonIcon,
  href,
  disabled = false,
  className,
}: {
  title: string
  description: string
  icon: React.JSX.Element
  buttonIcon: React.JSX.Element
  href?: string
  disabled?: boolean
  className?: string
}) {
  "use client"
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  if (href && !href.startsWith("/")) {
    throw new Error("href must start with /")
  }

  const buttonContent = () => {
    return (
      <div className='flex items-center justify-center space-x-2'>
        <span>{buttonIcon}</span>
        <span>{"Ir a " + title.toLowerCase()}</span>
      </div>
    )
  }
  return (
    <CardContainer className={cn("inter-var", className)}>
      <CardBody
        className={cn(
          "bg-background relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between min-h-48",
          disabled && "cursor-not-allowed"
        )}
      >
        <CardItem
          translateZ='50'
          className={cn(
            "text-xl font-bold text-secondary-foreground flex flex-row gap-2 items-center",
            disabled && "text-muted-foreground"
          )}
        >
          {icon}
          {title}
        </CardItem>
        <CardItem
          as='p'
          translateZ='60'
          className={cn("text-muted-foreground text-sm max-w-sm mt-2")}
        >
          {description}
        </CardItem>

        <CardItem translateZ='100' className='w-full'>
          {!disabled && href ? (
            <Link
              href={href}
              className={"w-full h-full"}
              onClick={() => setIsRedirecting(true)}
            >
              <StatefulButton
                variant={"default"}
                className='w-full'
                isLoading={isRedirecting}
              >
                {buttonContent()}
              </StatefulButton>
            </Link>
          ) : (
            <StatefulButton
              variant={"default"}
              className='w-full'
              disabled={disabled}
              onClick={() => setIsRedirecting(true)}
              isLoading={isRedirecting}
            >
              {buttonContent()}
            </StatefulButton>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  )
}
