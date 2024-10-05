"use client"
import React from "react"

import { GlobeIcon } from "@radix-ui/react-icons"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"

import SearchRecords from "@/components/search-records"

export default function Page() {
  return (
    <SearchRecords
      title='campaña'
      icon={<GlobeIcon className={DASHBOARD_ICON_CLASSES} />}
      shouldEnterText='el ID de la campaña'
      _route='IDAPLICACION'
      inputOptions={{ inputType: "text" }}
    />
  )
}
