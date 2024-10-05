import React from "react"

import { PersonIcon } from "@radix-ui/react-icons"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"

import SearchRecords from "@/components/search-records"

export default function Page() {
  return (
    <SearchRecords
      title='operador'
      icon={<PersonIcon className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='el ID del operador'
      _route='USUARIO'
      inputOptions={{
        inputType: "number",
      }}
    />
  )
}
