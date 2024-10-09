"use client"
import TitleContainer from "@/components/title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { CheckCircle, CircleAlert, Server, XCircle } from "lucide-react"
import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuery } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { Skeleton } from "@/components/ui/skeleton"

function getStatusAlert(variant: ServerStatusBadgeVariant, server: string) {
  switch (variant) {
    case ServerStatusBadgeVariant.OK:
      return (
        <Alert variant={"default"} className='w-fit min-w-[400px] bg-popover'>
          <CheckCircle size={GLOBAL_ICON_SIZE} />
          <AlertTitle>Operacional</AlertTitle>
          <AlertDescription>
            El servidor {server.toLocaleUpperCase()} funciona con normalidad.
          </AlertDescription>
        </Alert>
      )
    case ServerStatusBadgeVariant.Warning:
      return (
        <Alert
          variant={"destructive"}
          className='w-fit min-w-[400px] bg-popover'
        >
          <CircleAlert size={GLOBAL_ICON_SIZE} />
          <AlertTitle>Advertencia</AlertTitle>
          <AlertDescription>
            El servidor {server.toLocaleUpperCase()} está experimentando algunos
            problemas.
          </AlertDescription>
        </Alert>
      )
    case ServerStatusBadgeVariant.Error:
      return (
        <Alert
          variant={"destructive"}
          className='w-fit min-w-[400px] bg-popover'
        >
          <XCircle size={GLOBAL_ICON_SIZE} />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            El servidor {server.toLocaleUpperCase()} no está disponible.
          </AlertDescription>
        </Alert>
      )
    default:
      return (
        <Alert
          variant={"destructive"}
          className='w-fit min-w-[400px] bg-popover'
        >
          <XCircle size={GLOBAL_ICON_SIZE} />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Estatus del servidor desconocido</AlertDescription>
        </Alert>
      )
  }
}

export default function Page() {
  const {
    data: mainStatus,
    isLoading: isLoadingMain,
    isError: isErrorMain,
  } = useQuery({
    queryKey: ["main-status"],
    queryFn: async () => {
      const res = await fetch(`${await getHost()}/api/status/main`)
      if (!res.ok) {
        throw new Error("Failed to fetch status")
      }
      return await res.json()
    },
  })
  const {
    data: canaryStatus,
    isLoading: isLoadingCanary,
    isError: isErrorCanary,
  } = useQuery({
    queryKey: ["canary-status"],
    queryFn: async () => {
      const res = await fetch(`${await getHost()}/api/status/canary`)
      if (!res.ok) {
        throw new Error("Failed to fetch status")
      }
      return await res.json()
    },
  })
  return (
    <main className='flex flex-col w-full space-y-2'>
      <section className={"flex flex-col w-full space-y-4"}>
        <TitleContainer separate>
          <Server className={DASHBOARD_ICON_CLASSES} />
          <TypographyH4>
            Servidor de tareas{" "}
            <span className={"text-muted-foreground text-sm"}>[STABLE]</span>
          </TypographyH4>
        </TitleContainer>
        {isLoadingMain && (
          <Skeleton className='h-16 rounded-xl w-[400px] bg-pulse dark:bg-secondary' />
        )}
        {!isLoadingMain && getStatusAlert(mainStatus?.variant, "STABLE")}
      </section>
      <section className={"flex flex-col w-full space-y-4"}>
        <TitleContainer separate>
          <Server className={DASHBOARD_ICON_CLASSES} />
          <TypographyH4>
            Servidor de tareas{" "}
            <span className={"text-muted-foreground text-sm"}>[CANARY]</span>
          </TypographyH4>
        </TitleContainer>
        {isLoadingCanary && (
          <Skeleton className='h-16 rounded-xl w-[400px] bg-pulse dark:bg-secondary' />
        )}
        {!isLoadingCanary && getStatusAlert(canaryStatus?.variant, "CANARY")}
      </section>
    </main>
  )
}
