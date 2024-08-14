"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as ReactTableInstance,
} from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import TableRows from "@/components/tables/table-core/table-row"
import TableActions from "@/components/tables/table-core/table-actions"
import Pagination from "@/components/tables/table-core/pagination"

import type { PaginationModel, Recordings } from "@/lib/types"

interface DataTableProps<TData, TValue, DataType, classNameType, Recordings> {
  children?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  type: DataType
  className?: classNameType
  recordings?: Recordings
}

export default function DataTable<TData, TValue, DataType>({
  children,
  columns,
  data,
  type,
  className,
  recordings,
}: DataTableProps<TData, TValue, string, string, Recordings>) {
  // Filtering
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Pagination
  const INIT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 }
  const [pagination, setPagination] = useState(INIT_PAGINATION)

  const table: ReactTableInstance<TData> = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  })

  return (
    <>
      <div className={cn("", className)}>
        <TableActions
          table={table as ReactTableInstance<TData>}
          type={type as string}
          recordings={recordings}
        >
          {children}
        </TableActions>
        <div className='rounded-md border bg-primary-foreground'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  <TableHead>
                    <Checkbox
                      id={`select-all-${type}`}
                      checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                      }
                      onCheckedChange={value =>
                        table.toggleAllPageRowsSelected(!!value)
                      }
                    >
                      <span className='sr-only'>Select all {`${type}`}</span>
                    </Checkbox>
                  </TableHead>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={`header-${header.id}`}
                      className='text-start p-1.5 text-sm font-normal'
                    >
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
              <TableRows
                table={table as ReactTableInstance<TData>}
                columns={columns}
                type={type as string}
              />
            </TableBody>
          </Table>
        </div>
        <Pagination table={table} type={type} pagination={pagination} />
      </div>
    </>
  )
}
