import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import TasksTable from "@/components/dashboard/advanced/tasks-table"
import RecordsTable from "@/components/dashboard/advanced/records-table"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales } from "@/lib/types.d"
import TableContainer from "@/components/tables/table-core/table-container"

async function fetchAdvancedDashboardData() {
  const recordings = fetch("/api/recordings", {
    cache: "no-store",
  })
  const tasks = fetch("/api/tasks", {
    cache: "no-store",
  })
  const [taskResponse, recordingResponse] = await Promise.all([
    tasks,
    recordings,
  ])
  if (!taskResponse.ok) {
    throw new Error("Failed to fetch tasks")
  }
  if (!recordingResponse.ok) {
    throw new Error("Failed to fetch recordings")
  }
  return [taskResponse.json(), recordingResponse.json()]
}
/**
 * @deprecated
 */
export default function AdvancedDashboard() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["all"],
    queryFn: fetchAdvancedDashboardData,
  })

  const taskData = data?.[0] ?? []
  const recordingData = data?.[1] ?? []

  return (
    <main id='tables' className='flex flex-col px-2 items-center py-4'>
      <TableContainer separate>
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <>
            <ErrorCodeUserFriendly
              error={error}
              locale={SupportedLocales.Values.es}
            />
          </>
        ) : (
          <TasksTable err={error} res={taskData} />
        )}
      </TableContainer>
      <TableContainer>
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorCodeUserFriendly
            error={error}
            locale={SupportedLocales.Values.es}
          />
        ) : (
          <RecordsTable err={error} res={recordingData} />
        )}
      </TableContainer>
    </main>
  )
}
