"use client"

import {
  ColumnDef,
  flexRender,
  Table as ReactTableInstance,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"

interface TableRowsProps<TData> {
  table: ReactTableInstance<TData>
  columns: ColumnDef<TData, any>[]
  type?: string
}

export default function TableRows<TData>({
  table,
  columns,
  type,
}: TableRowsProps<TData>) {
  "use client"
  if (table.getRowModel().rows?.length) {
    return (
      <>
        {table.getRowModel().rows.map((row: any) => (
          <TableRow
            key={`row-${row.id}`}
            data-state={row.getIsSelected() && "selected"}
          >
            <TableCell>
              <Checkbox
                id={row.id}
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
              >
                <span className='sr-only'>Select item {row.id}</span>
              </Checkbox>
            </TableCell>
            {row.getVisibleCells().map((cell: any) => (
              <TableCell key={`cell-${cell.id}`} className='text-start'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    )
  } else {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className='h-24 text-center'>
          Sin resultados.
        </TableCell>
      </TableRow>
    )
  }
}
