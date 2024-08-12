import "server-only"
import { createTask, getRecords } from "@/lib/actions"
import { _recordsPath, _urlBase, _urlCanary } from "@/lib/api/paths"
import { columns } from "@/components/tables/records-table/columns-records"
import DataTable from "@/components/tables/table-core/data-table"
import { SupportedLocales, type Recordings } from "@/lib/types.d"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"

export default async function TablaRecordings({
  reset,
}: {
  reset?: () => void
}) {
  let recordings: Recordings
  try {
    recordings = await getRecords(_urlCanary, _recordsPath, true)
  } catch (error: any) {
    return (
      <ErrorCodeUserFriendly error={error} locale={SupportedLocales.SPANISH} />
    )
  }

  async function POSTTask(url: string, fileName: string, params: any) {
    return await createTask(
      _urlBase,
      "/speech-to-text",
      url,
      params,
      null,
      false,
      fileName
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
