import * as React from "react"

import { SupportedLocales, TableSupportedDataTypes } from "@/lib/types.d"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import TableContainer from "@/components/tables/table-core/table-container"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { CustomBorderCard } from "@/components/custom-border-card"

export default async function Page() {
  // Server rendering done the right way pa 😎
  const [err, res] = await fetch("/api/tasks").then(async res => {
    if (!res.ok) {
      return [new Error("No se pudo recuperar la lista de tareas"), null]
    }
    return await res.json()
  })
  let description: string = !res
    ? "No se han encontrado tareas."
    : `Se han encontrado ${res && res?.length} tareas.`
  description =
    !!res && res.length > 0 ? description : `No se han encontrado tareas.`
  return (
    <TableContainer>
      {err !== null && (
        <ErrorCodeUserFriendly
          error={err}
          locale={SupportedLocales.Values.es}
        />
      )}
      {res !== null && err === null && (
        <div className='flex flex-col gap-2'>
          <CustomBorderCard
            description={description}
            variant={
              err !== null
                ? "error"
                : res === null
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
