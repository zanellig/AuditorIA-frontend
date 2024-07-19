"use client"
import DataTable from "@/components/data-table"
import { columns } from "@/lib/columns-records"
import { getRecords } from "@/lib/actions"
import { useEffect, useState } from "react"
import { Records } from "@/lib/types"
import DashboardSkeleton from "./skeletons/dashboard-skeleton"
import TableContainer from "./table-core/table-container"

import SubtitleH2 from "./typography/subtitleH2"

export default async function TablaRecords() {
  const [records, setRecords] = useState<Records | null>(null)
  useEffect(() => {
    const updateRecords = async () => {
      getRecords().then(updatedRecords => {
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
