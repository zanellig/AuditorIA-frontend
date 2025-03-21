import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { _URLBuilder } from "@/lib/utils"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { TasksRecordsResponse } from "@/lib/types"

interface ServerDataTableProps<TData extends TasksRecordsResponse> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export default function ServerDataTable<TData extends TasksRecordsResponse>({
  columns,
  data,
}: ServerDataTableProps<TData>) {
  const router = useRouter()
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div className='rounded-md border border-input bg-background shadow-md overflow-hidden'>
      <Table className='inline-table whitespace-nowrap text-sm font-medium'>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className='text-center'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              onClick={() => {
                router.push(
                  _URLBuilder({
                    identifier: row.original.uuid! as string,
                    file_name: row.original.file_name! as string,
                  })
                )
              }}
              className='cursor-pointer'
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className='text-center'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
