import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import TasksTable from "@/components/dashboard/advanced/tasks-table"
import RecordsTable from "@/components/dashboard/advanced/records-table"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales } from "@/lib/types.d"
import TableContainer from "@/components/tables/table-core/table-container"

async function fetchTasks() {
  const response = await fetch("http://10.20.30.211:3001/api/tasks")
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }
  return response.json()
}

async function fetchRecordings() {
  const response = await fetch("http://10.20.30.211:3001/api/recordings", {
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error("Failed to fetch recordings")
  }
  return response.json()
}

export default function AdvancedDashboard() {
  const {
    data: taskData,
    error: taskError,
    isLoading: taskLoading,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  })

  const {
    data: recordingData,
    error: recordingError,
    isLoading: recordingLoading,
  } = useQuery({
    queryKey: ["recordings"],
    queryFn: fetchRecordings,
  })

  return (
    <main id='tables' className='flex flex-col px-2 items-center py-4'>
      {/* <TableContainer separate>
        {taskLoading ? (
          <DashboardSkeleton />
        ) : taskError ? (
          <>
            <ErrorCodeUserFriendly
              error={taskError}
              locale={SupportedLocales.ES}
            />
          </>
        ) : (
          <TasksTable err={taskData[0]} res={taskData[1]} />
        )}
      </TableContainer>
      <TableContainer>
        {recordingLoading ? (
          <DashboardSkeleton />
        ) : recordingError ? (
          <ErrorCodeUserFriendly
            error={recordingError}
            locale={SupportedLocales.ES}
          />
        ) : (
          <RecordsTable err={recordingData[0]} res={recordingData[1]} />
        )}
      </TableContainer> */}
    </main>
  )
}
