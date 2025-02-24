"use client"
import TitleContainer from "@/components/title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { CheckCircle, CircleAlert, Server, XCircle } from "lucide-react"
import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQueries } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"
import { ServerStatusBadgeVariant } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import RotatingTextDiv from "@/components/rotating-text-div"

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
  const statusQueries = useQueries({
    queries: ["main", "canary"].map(server => {
      return {
        queryKey: [server],
        queryFn: async () => {
          const res = await fetch(`${await getHost()}/api/status/${server}`)
          if (!res.ok) {
            throw new Error("Failed to fetch status")
          }
          return await res.json()
        },
        enabled: true,
        staleTime: Infinity,
        refetchOnWindowFocus: true,
      }
    }),
  })

  return (
    <main className='flex flex-col w-full space-y-2'>
      {statusQueries.map(query => {
        return (
          <section className={"flex flex-col w-full space-y-4"}>
            <TitleContainer separate>
              <Server className={DASHBOARD_ICON_CLASSES} />
              <TypographyH4 className='flex gap-2 items-center'>
                {!query.isLoading && (
                  <>
                    <span>
                      Servidor {query.data?.server.toLocaleUpperCase()}
                    </span>
                    <span className={"text-muted-foreground text-sm"}>
                      [{query.data?.release}]
                    </span>
                  </>
                )}
                {query.isLoading && !query.isError && (
                  <RotatingTextDiv
                    className='text-muted-foreground'
                    rotatingTexts={[
                      "Cargando datos del servidor...",
                      "Obteniendo métricas de estabilidad...",
                      "Esto puede demorar unos segundos...",
                    ]}
                  />
                )}
                {query.isError && (
                  <RotatingTextDiv
                    className='text-error'
                    rotatingTexts={[
                      "Error al obtener datos...",
                      "Intente nuevamente más tarde...",
                    ]}
                  />
                )}
              </TypographyH4>
            </TitleContainer>
            {query.isLoading && !query.isError && (
              <Skeleton className='h-16 rounded-xl w-[400px] bg-pulse dark:bg-secondary' />
            )}
            {!query.isLoading &&
              !query.isError &&
              query.data &&
              getStatusAlert(query.data?.variant, query.data?.server)}
            {query.isError &&
              getStatusAlert(ServerStatusBadgeVariant.Error, "UNKNOWN")}
          </section>
        )
      })}
    </main>
  )
}
