import * as React from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SupportedLocales, Task, Tasks } from "@/lib/types.d"
import DataTable from "@/components/tables/table-core/data-table"
import { columns } from "@/components/tables/tasks-table/columns-tareas"
import TableContainer from "@/components/tables/table-core/table-container"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"

export default async function Test() {
  const [err, res] = await fetch("http://localhost:3001/api/tasks").then(
    async res => {
      return await res.json()
    }
  )

  return (
    <TableContainer>
      {err !== null && (
        <ErrorCodeUserFriendly error={err} locale={SupportedLocales.ES} />
      )}
      {res !== null && err === null && (
        <div className='flex flex-col gap-2'>
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription className='text-success'>
                {res.length} tareas encontradas.
              </CardDescription>
            </CardHeader>
          </Card>
          <DataTable columns={columns} data={res} type='tasks' />
        </div>
      )}
    </TableContainer>
  )
}
