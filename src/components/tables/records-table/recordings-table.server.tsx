"use client"
import { useEffect, useState } from "react"
import { createTask, getRecords } from "@/lib/actions"
import {
  ALL_RECORDS_PATH,
  API_MAIN,
  API_CANARY,
  TESTING_RECORDINGS,
} from "@/lib/consts"
import { columns } from "@/components/tables/records-table/columns-records"
import DataTable from "@/components/tables/table-core/data-table"
import { SupportedLocales, type Recordings } from "@/lib/types.d"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"

export default async function RecordingsTable() {
  if (TESTING_RECORDINGS) {
    return (
      <DataTable columns={columns} data={[]} type={"records"} recordings={[]} />
    )
  }
  const [err, setErr] = useState(null)
  const [recordings, setRecordings] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [err, res] = await fetch(`http://localhost:3001/api/recordings`, {
        method: "GET",
      }).then(async res => await res.json())
      setErr(err)
      setRecordings(res)
    }
    fetchData()
  }, [])

  if (err !== null) {
    return <ErrorCodeUserFriendly error={err} locale={SupportedLocales.ES} />
  }
  if (recordings) {
    return (
      <DataTable
        columns={columns}
        data={recordings}
        type={"records"}
        recordings={recordings}
      />
    )
  }
  return <DashboardSkeleton />
}
