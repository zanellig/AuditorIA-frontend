import React from "react"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import SearchRecords from "@/components/search-records"
import { CalendarSearch } from "lucide-react"

export default function Page() {
  return (
    <SearchRecords
      title='fecha'
      icon={<CalendarSearch className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='la fecha del llamado'
      _route='fecha'
      inputOptions={{
        inputType: "date",
      }}
    />
  )
}
