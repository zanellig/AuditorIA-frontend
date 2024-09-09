import * as React from "react"

import { CalendarIcon } from "@radix-ui/react-icons"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"

import SearchRecords from "@/components/search-records"

export default function Page() {
  return (
    <SearchRecords
      title='fecha'
      icon={<CalendarIcon className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='la fecha del llamado'
      _route='FECHA'
      inputOptions={{
        inputType: "date",
      }}
    />
  )
}
