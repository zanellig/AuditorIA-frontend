import "server-only"
import { getTasks } from "@/lib/actions"
import { _tasksPath, _urlBase } from "@/lib/api/paths"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales, Tasks } from "@/lib/types.d"

export default async function TablaTasks({ reset }: { reset?: () => void }) {
  let allTasks: Tasks
  try {
    allTasks = await getTasks(_urlBase, _tasksPath, true)
  } catch (error: any) {
    return (
      <ErrorCodeUserFriendly error={error} locale={SupportedLocales.ENGLISH} />
    )
  }
  return <DataTable columns={columns} data={allTasks} type={"tasks"} />
}
