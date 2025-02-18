import { getHost } from "@/lib/actions"
import { TaskRecordsSearchParams } from "@/lib/types.d"

export const fetchTasksRecords = async (params: TaskRecordsSearchParams) => {
  const url = new URL(`${await getHost()}/api/tasks-records`)
  const { page, globalSearch, ...filterParams } = params

  // Check if all filter params are nullish
  const areAllFiltersEmpty = Object.values(filterParams).every(
    value => value === null || value === undefined
  )

  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  if (areAllFiltersEmpty && globalSearch !== null) {
    url.searchParams.set("search", globalSearch)
  }

  // Always set page
  url.searchParams.set("page", page.toString())

  const data = await fetch(url.toString()).then(res => res.json())
  return data
}
