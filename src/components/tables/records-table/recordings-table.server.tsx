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

export default async function RecordingsTable({
  reset,
}: {
  reset?: () => void
}) {
  if (TESTING_RECORDINGS) {
    return (
      <DataTable columns={columns} data={[]} type={"records"} recordings={[]} />
    )
  }
  let recordings: Recordings
  try {
    recordings = await getRecords([API_CANARY, ALL_RECORDS_PATH], true)
  } catch (error: any) {
    return (
      <ErrorCodeUserFriendly error={error} locale={SupportedLocales.SPANISH} />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={recordings}
      type={"records"}
      recordings={recordings}
    />
  )
}
