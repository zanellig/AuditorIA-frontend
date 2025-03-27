import { getHost } from "@/lib/actions"
import {
  TaskRecordsSearchParams,
  TasksRecordsInternalResponse,
} from "@/lib/types"

export const fetchTasksRecords = async (params: TaskRecordsSearchParams) => {
  const url = new URL("http://10.20.62.96:5678/webhook/tasks-records")
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

  const data: TasksRecordsInternalResponse = await fetch(url.toString()).then(
    res => res.json()
  )

  return data
}
