import "server-only"
import { getTasks } from "@/lib/actions"
import { ALL_TASKS_PATH, URL_API_MAIN } from "@/lib/consts"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales, Tasks } from "@/lib/types.d"

export default async function TablaTasks() {
  let allTasks: Tasks
  try {
    allTasks = await getTasks([URL_API_MAIN, ALL_TASKS_PATH], true)
  } catch (error: any) {
    return (
      <ErrorCodeUserFriendly error={error} locale={SupportedLocales.ENGLISH} />
    )
  }
  return <DataTable columns={columns} data={allTasks} type={"tasks"} />
}
