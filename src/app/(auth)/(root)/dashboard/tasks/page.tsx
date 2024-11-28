"use client"
import React from "react"
import { SupportedLocales, TableSupportedDataTypes } from "@/lib/types.d"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import TableContainer from "@/components/tables/table-core/table-container"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { CustomBorderCard } from "@/components/custom-border-card"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { useTasks } from "@/lib/hooks/use-tasks"

export default function TasksPage() {
  const TASKS_QUERY_KEY = ["tasks"]
  const {
    status,
    data: tasks,
    error: err,
    isLoading,
  } = useTasks({ queryKey: TASKS_QUERY_KEY })
  let description: string = !tasks
    ? "No se han encontrado tareas."
    : `Se han encontrado ${tasks && tasks?.length} tareas.`
  description =
    !!tasks && tasks.length > 0 ? description : `No se han encontrado tareas.`
  return (
    <TableContainer>
      {isLoading && <DashboardSkeleton />}
      {err !== null && (
        <ErrorCodeUserFriendly
          error={err}
          locale={SupportedLocales.Values.es}
        />
      )}
      {!isLoading && !!tasks && (
        <div className='flex flex-col gap-2'>
          <CustomBorderCard
            description={description}
            variant={
              err !== null
                ? "error"
                : !tasks
                  ? "warning"
                  : tasks.length === 0
                    ? "default"
                    : "success"
            }
          />
          <DataTable
            columns={columns}
            data={tasks}
            type={TableSupportedDataTypes.Tasks}
            queryKey={TASKS_QUERY_KEY}
            status={status}
          />
        </div>
      )}
    </TableContainer>
  )
}
