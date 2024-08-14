"use client"
import { Badge } from "@/components/ui/badge"
import { ServerStatus } from "@/lib/types.d"
import { useEffect, useState } from "react"
import { URL_API_MAIN, URL_API_CANARY } from "@/lib/consts"
import { checkServerStatus } from "@/lib/actions"
export default async function StatusBadges() {
  enum ServerStatus {
    OK = "success",
    Warning = "warning",
    Error = "error",
    Unknown = "default",
  }

  const [mainServerStatusBadgeOptions, setMainServerStatusBadgeOptions] =
    useState({
      variant: ServerStatus.Unknown,
      text: "?",
    })
  const [canaryServerStatusOptions, setCanaryServerStatusOptions] = useState({
    variant: ServerStatus.Unknown,
    text: "?",
  })

  const mainServerStatus = await checkServerStatus()

  useEffect(() => {
    if (mainServerStatus === 200) {
      setMainServerStatusBadgeOptions({ variant: ServerStatus.OK, text: "OK" })
    } else if (typeof mainServerStatus === "number") {
      setMainServerStatusBadgeOptions({
        variant: ServerStatus.Warning,
        text: "Warning",
      })
    } else {
      setMainServerStatusBadgeOptions({
        variant: ServerStatus.Error,
        text: "Error",
      })
    }
    if (canaryServerStatus === 200) {
      setCanaryServerStatusOptions({ variant: ServerStatus.OK, text: "OK" })
    } else if (typeof canaryServerStatus === "number") {
      setCanaryServerStatusOptions({
        variant: ServerStatus.Warning,
        text: "Warning",
      })
    } else {
      setCanaryServerStatusOptions({
        variant: ServerStatus.Error,
        text: "Error",
      })
    }
  }, [])

  return (
    <div className='flex flex-row space-x-2 h-fit w-fit items-center'>
      <Badge variant={mainServerStatusBadgeOptions.variant}>
        <span>{`${mainServerStatusBadgeOptions.text}`}</span>
      </Badge>
      <Badge variant={canaryServerStatusOptions.variant}>
        <span>{`${canaryServerStatusOptions.text}`}</span>
      </Badge>
    </div>
  )
}
