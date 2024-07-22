"use client"

import { useEffect, useState } from "react"
import { headers } from "next/headers"
import { getRecords } from "@/lib/actions"

import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/records-table/columns-records"
import { Records } from "@/lib/types"
import DashboardSkeleton from "./skeletons/dashboard-skeleton"
import TableContainer from "./tables/table-core/table-container"

import SubtitleH2 from "./typography/subtitleH2"

export default async function TablaRecords() {
  const headersList = headers()
  const origin = headersList.get("origin")

  const [records, setRecords] = useState<Records | null>(null)
  useEffect(() => {
    const updateRecords = async () => {
      getRecords(origin as string).then(updatedRecords => {
        setRecords(updatedRecords)
        console.log(updatedRecords)
      })
    }

    updateRecords()
  }, [])

  return (
    <TableContainer>
      <SubtitleH2>Grabaciones</SubtitleH2>
      {records ? (
        <DataTable columns={columns} data={records} type={"records"} />
      ) : (
        <DashboardSkeleton />
      )}
    </TableContainer>
  )
}
