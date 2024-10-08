import React from "react"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import SearchRecords from "@/components/search-records"
import { User } from "lucide-react"

export default function Page() {
  return (
    <SearchRecords
      title='operador'
      icon={<User className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='el ID del operador'
      _route='USUARIO'
      inputOptions={{
        inputType: "number",
      }}
    />
  )
}
