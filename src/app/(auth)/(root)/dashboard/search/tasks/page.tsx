"use client"
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { SupportedLocales, TableSupportedDataTypes } from "@/lib/types.d"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import TableContainer from "@/components/tables/table-core/table-container"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { CustomBorderCard } from "@/components/custom-border-card"
import { getHost } from "@/lib/actions"
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"

export default function TasksPage() {
  const {
    data: res,
    error: err,
    isLoading,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const host = await getHost()
      const res = await fetch(`${host}/api/tasks`, {
        headers: getHeaders(host, AllowedContentTypes.Json),
      }).then(async res => {
        if (!res.ok) {
          throw new Error("(1019): Error de red.")
        }
        const [err, tasks] = await res.json()
        if (err) {
          throw new Error(err)
        }
        return tasks
      })
      return res
    },
  })
  let description: string = !res
    ? "No se han encontrado tareas."
    : `Se han encontrado ${res && res?.length} tareas.`
  description =
    !!res && res.length > 0 ? description : `No se han encontrado tareas.`
  return (
    <TableContainer>
      {isLoading && <DashboardSkeleton />}
      {err !== null && (
        <ErrorCodeUserFriendly
          error={err}
          locale={SupportedLocales.Values.es}
        />
      )}
      {!isLoading && !!res && (
        <div className='flex flex-col gap-2'>
          <CustomBorderCard
            description={description}
            variant={
              err !== null
                ? "error"
                : !res
                  ? "warning"
                  : res.length === 0
                    ? "default"
                    : "success"
            }
          />
          <DataTable
            columns={columns}
            data={res}
            type={TableSupportedDataTypes.Tasks}
          />
        </div>
      )}
    </TableContainer>
  )
}
