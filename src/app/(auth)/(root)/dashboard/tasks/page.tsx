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
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function TasksPage() {
  const queryClient = getQueryClient()
  const TASKS_QUERY_KEY = ["tasks"]

  const {
    data: res,
    error: err,
    isLoading,
  } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      const host = await getHost()
      const res = await fetch(`${host}/api/tasks`, {
        headers: getHeaders(host, AllowedContentTypes.Json),
      }).then(async res => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        const [err, tasks] = await res.json()
        if (err) {
          throw new Error(err)
        }
        return tasks
      })
      return res
    },
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  })
  let description: string = !res
    ? "No se han encontrado tareas."
    : `Se han encontrado ${res && res?.length} tareas.`
  description =
    !!res && res.length > 0 ? description : `No se han encontrado tareas.`
  return (
    <QueryClientProvider client={queryClient}>
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
              queryKey={TASKS_QUERY_KEY}
            />
          </div>
        )}
      </TableContainer>
    </QueryClientProvider>
  )
}
