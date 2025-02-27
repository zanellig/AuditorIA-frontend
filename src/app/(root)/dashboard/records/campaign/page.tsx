import React from "react"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import SearchRecords from "@/components/search-records"
import { Headset } from "lucide-react"

export default function Page() {
  return (
    <SearchRecords
      title='campaña'
      icon={<Headset className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='el ID de la campaña'
      _route='IDAPLICACION'
      inputOptions={{ inputType: "number" }}
    />
  )
}
