import TableContainer from "@/components/tables/table-core/table-container"
import { FileTextIcon } from "@radix-ui/react-icons"
import { TypographyH4 } from "@/components/typography/h4"
import { Separator } from "@/components/ui/separator"
import TableTitleContainer from "@/components/tables/table-core/table-title-container"
import DataTable from "@/components/tables/table-core/data-table"
import { columns as tasksColumns } from "@/components/tables/tasks-table/columns-tareas"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import { SupportedLocales, TableSupportedDataTypes, Tasks } from "@/lib/types.d"

type TasksTableProps = {
  err: unknown
  res: Tasks
}

export default async function TaskTable({ err, res }: TasksTableProps) {
  return (
    <>
      <TableTitleContainer>
        <FileTextIcon className='h-[1.2rem] w-[1.2rem] text-muted-foreground' />
        <TypographyH4>Tareas</TypographyH4>
      </TableTitleContainer>
      <Separator className='my-4' />
      {err !== null && (
        <ErrorCodeUserFriendly
          error={err}
          locale={SupportedLocales.Values.es}
        />
      )}
      <DataTable
        columns={tasksColumns}
        data={res}
        type={TableSupportedDataTypes.Tasks}
      />
    </>
  )
}
