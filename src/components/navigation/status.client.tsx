"use client"
import { Badge } from "@/components/ui/badge"
import { Suspense, useEffect, useState } from "react"
import { ServerStatusBadgeVariant, ServerStatusResponse } from "@/lib/types.d"
import { Skeleton } from "../ui/skeleton"
export default function StatusBadges() {
  const [mainServerStatusBadgeOptions, setMainServerStatusBadgeOptions] =
    useState<ServerStatusResponse>({
      variant: ServerStatusBadgeVariant.Unknown,
      text: "",
    })
  const [canaryServerStatusOptions, setCanaryServerStatusOptions] =
    useState<ServerStatusResponse>({
      variant: ServerStatusBadgeVariant.Unknown,
      text: "",
    })

  useEffect(() => {
    fetch("/api/status/main", { method: "GET" }).then(async res => {
      const response = await res.json()
      setMainServerStatusBadgeOptions(response)
    })
    fetch("/api/status/canary", { method: "GET" }).then(async res => {
      const response = await res.json()
      setCanaryServerStatusOptions(response)
    })
  }, [])

  return (
    <div className='flex flex-row space-x-2 h-fit w-fit items-center'>
      {mainServerStatusBadgeOptions.text.length === 0 ? (
        <StatusBadgesSkeleton />
      ) : (
        <Badge variant={mainServerStatusBadgeOptions.variant}>
          <span>{mainServerStatusBadgeOptions.text}</span>
        </Badge>
      )}

      {canaryServerStatusOptions.text.length === 0 ? (
        <StatusBadgesSkeleton />
      ) : (
        <Badge variant={canaryServerStatusOptions.variant}>
          <span>{canaryServerStatusOptions.text}</span>
        </Badge>
      )}
    </div>
  )
}

export function StatusBadgesSkeleton() {
  return <Skeleton className='w-28 h-6 rounded-md bg-pulse dark:bg-secondary' />
}
