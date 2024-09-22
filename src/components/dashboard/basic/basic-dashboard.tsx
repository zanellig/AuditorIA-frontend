import {
  ArrowRightIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ExclamationTriangleIcon,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  LoopIcon,
  PersonIcon,
  UploadIcon,
} from "@radix-ui/react-icons"
import * as React from "react"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { StatefulButton } from "@/components/stateful-button"

export default function BasicDashboard() {
  const dashboardItems = [
    {
      title: "Transcripción manual",
      icon: <UploadIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá transcribir audios de manera manual.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/upload",
    },

    {
      title: "Ver tu historial",
      icon: <FileTextIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver su historial de transcripciones.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/tasks",
    },
    {
      title: "Buscar por campaña",
      icon: <GlobeIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por campaña.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/records/campaign",
    },
    {
      title: "Buscar por operador",
      icon: <PersonIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los audios por operador.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/records/operator",
    },
    {
      title: "Ver audios problemáticos",
      icon: <ExclamationTriangleIcon className={DASHBOARD_ICON_CLASSES} />,
      description:
        "En este módulo, podrá ver y revisar los audios marcados como problemáticos.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/tasks/ponderation",
      disabled: true,
    },
    {
      title: "Buscar por fecha",
      icon: <CalendarIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por fecha.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/records/date",
    },
    {
      title: "Buscar por dirección",
      icon: <LoopIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá buscar los audios por dirección.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/dashboard/search/records/direction",
    },
    {
      title: "Ver reportes",
      icon: <FileIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver los reportes.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
      href: "/reportes",
    },
    {
      title: "Ver chats",
      icon: <ChatBubbleIcon className={DASHBOARD_ICON_CLASSES} />,
      description: "En este módulo, podrá ver y analizar los chats.",
      buttonIcon: (
        <ArrowRightIcon
          className={DASHBOARD_ICON_CLASSES + "text-foreground"}
        />
      ),
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
            buttonIcon={dashboardItem.buttonIcon}
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
      <>
        {"Ir a " + title.toLowerCase()}
        <span className='sr-only'>{"Ir a " + title.toLowerCase()}</span>
      </>
    )
  }
  return (
    <CardContainer className={cn("inter-var ")}>
      <CardBody
        className={cn(
          "bg-background relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto lg:min-h-[200px] lg:min-w-full rounded-xl p-4 border flex flex-col gap-2 justify-between",
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
            <Link href={href} onClick={() => setIsRedirecting(true)}>
              <StatefulButton
                variant={"default"}
                className='w-full'
                isLoading={isRedirecting}
                icon={buttonIcon}
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
              icon={buttonIcon}
            >
              {buttonContent()}
            </StatefulButton>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  )
}
