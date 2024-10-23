"use client"
import React, { useState } from "react"
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
  TableOptions,
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

import type { TableSupportedDataTypes, Recordings } from "@/lib/types"
import { type QueryKey } from "@tanstack/react-query"

interface DataTableProps<TData, TValue, classNameType, Recordings> {
  children?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  type?: TableSupportedDataTypes
  className?: classNameType
  queryKey: QueryKey
}

export interface TableWithQueryKey<TData> extends ReactTableInstance<TData> {
  queryInfo?: {
    queryKey: QueryKey
  }
}

// Factory hook to create the table with a queryKey
function useTableWithQueryKey<TData>(
  tableOptions: TableOptions<TData>,
  queryKey: QueryKey
): TableWithQueryKey<TData> {
  // Create the table using the provided options
  const table = useReactTable(tableOptions) as TableWithQueryKey<TData>

  // Attach the queryKey to the table instance as metadata
  table.queryInfo = {
    queryKey,
  }

  return table
}

export default function DataTable<TData, TValue>({
  children,
  columns,
  data,
  type,
  className,
  queryKey = [],
}: DataTableProps<TData, TValue, string, Recordings>) {
  // Filtering
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Pagination
  const INIT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 }
  const [pagination, setPagination] = useState(INIT_PAGINATION)

  const table: ReactTableInstance<TData> = useTableWithQueryKey(
    {
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(), // needed for client-side filtering
      onColumnVisibilityChange: setColumnVisibility,
      globalFilterFn: (row, columnId, filterValue, addMeta) => {
        const value = row.getValue(columnId)
        return (
          value !== null &&
          value !== undefined &&
          String(value)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())
        )
      },
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
      },
      onPaginationChange: setPagination,
      autoResetPageIndex: false,
      enableRowPinning: true,
      keepPinnedRows: false,
    },
    queryKey
  )

  return (
    <>
      <div className={cn("", className)}>
        <TableActions<TData>
          table={table as ReactTableInstance<TData>}
          data={data}
        >
          {children}
        </TableActions>
        <div className='rounded-md border bg-background'>
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
                type={type as TableSupportedDataTypes}
              />
            </TableBody>
          </Table>
        </div>
        <Pagination
          table={table}
          type={type as TableSupportedDataTypes}
          pagination={pagination}
        />
      </div>
    </>
  )
}
