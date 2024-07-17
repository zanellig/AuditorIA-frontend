"use client"
import { useState } from "react"

// import { useDebounce, useDebouncedCallback } from "use-debounce"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CaretSortIcon,
  CheckIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  MixerHorizontalIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons"

import { CirclePlus } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { Task } from "@/lib/tasks"
import DeleteButton from "./DeleteButton"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Filtering
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([])

  // Pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Página inicial
    pageSize: 10, // Tamaño de página inicial
  })
  const [inputValue, setInputValue] = useState<string>("") // Estado para el valor del input

  const pageSizeOptions = [10, 50, 100, 500, 1000]

  const table = useReactTable({
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
  })

  function renderRows() {
    if (table.getRowModel().rows?.length) {
      return (
        <>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={`row-${row.id}`}
              data-state={row.getIsSelected() && "selected"}
              className='hover:bg-secondary p-2'
            >
              <TableCell className='text-center'>
                <Checkbox
                  id={row.id}
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                >
                  <span className='sr-only'>Select item {row.id}</span>
                </Checkbox>
              </TableCell>
              {row.getVisibleCells().map((cell, i) => (
                <TableCell
                  key={`cell-${cell.id}`}
                  className={
                    i === row.getVisibleCells().length - 1
                      ? "text-end"
                      : "text-start" + " "
                  }
                >
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
            No se encontraron tareas...
          </TableCell>
        </TableRow>
      )
    }
  }

  return (
    <>
      <TableActions table={table} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                <TableHead className='text-center'>
                  <Checkbox
                    id='select-all-tasks'
                    checked={
                      table.getIsAllPageRowsSelected() ||
                      (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={value =>
                      table.toggleAllPageRowsSelected(!!value)
                    }
                  >
                    <span className='sr-only'>Select all items</span>
                  </Checkbox>
                </TableHead>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={`header-${header.id}`}
                    className='text-left p-1.5 text-sm font-normal'
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
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} filas seleccionadas.
        </div>

        {/* componente de pagination */}
        <div className='flex flex-row flex-1 font-bold items-center'>
          <span className='text-sm '>Tareas por página </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                className='ml-2 w-fit justify-between'
              >
                {pagination.pageSize}
                <CaretSortIcon className='ml-2 shrink-0 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[200px]' align='end'>
              <div className='p-0 m-0'>
                <Input
                  type='number'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  placeholder='Cantidad de tareas...'
                  className='w-full text-sm text-left border-0 focus-visible:ring-0'
                  value={inputValue}
                  onChange={event => {
                    setInputValue(event.target.value)
                    const customValue = Number(event.target.value)
                    if (!isNaN(customValue) && customValue > 0) {
                      table.setPageSize(customValue)
                    }
                  }}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  onKeyUp={e => e.stopPropagation()}
                  onBlur={() => {
                    setInputValue("")
                  }}
                />
              </div>
              <DropdownMenuSeparator />

              {pageSizeOptions.map(pageSize => (
                <DropdownMenuItem
                  key={"page-size-" + pageSize}
                  onClick={() => {
                    table.setPageSize(pageSize)
                    setInputValue("")
                  }}
                >
                  <div className='flex flex-row items-center justify-between w-full h-full'>
                    <div className='flex-1'>{pageSize}</div>
                    <div>
                      {pageSize === pagination.pageSize ? (
                        <CheckIcon className='h-4 w-4  right-10' />
                      ) : null}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* componente de pagination count */}
        <div className='items-center text-sm font-bold pr-2'>
          <span>Página </span>
          <span>{table.getState().pagination.pageIndex + 1}</span>
          <span> de </span>
          <span>{table.getPageCount()}</span>
        </div>

        {/* componente botonera pagination */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <DoubleArrowLeftIcon />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          <DoubleArrowRightIcon />
        </Button>
      </div>
    </>
  )
}

export function TableActions({ table }: { table: any }) {
  return (
    <div className='flex py-4 items-center w-full justify-between'>
      <Input
        placeholder='Filtrar transcripciones...'
        value={
          (table.getColumn("identifier")?.getFilterValue() as string) ?? ""
        }
        onChange={event =>
          table.getColumn("identifier")?.setFilterValue(event.target.value)
        }
        className='max-w-sm h-8'
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='mr-auto ml-2 h-8 w-fit space-x-1 font-medium border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-xs border-dashed '
          >
            <CirclePlus size={GLOBAL_ICON_SIZE} />
            <span>Estado</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* TODO: implementar funcionalidad */}
          <Button
            variant='outline'
            className=' h-8 w-fit space-x-2 font-normal'
            onClick={event => event.stopPropagation()}
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
          >
            <span>Acciones sobre celdas seleccionadas</span>
            <Pencil1Icon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              console.log(
                table.getSelectedRowModel().rows.map(r => r.original.identifier)
              )
            }}
          >
            Reintentar transcripción
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              let UUIDsACopiar: Task["identifier"][] = []
              let UUIDs: Task["identifier"] = ""
              table
                .getSelectedRowModel()
                .rows.map(r => UUIDsACopiar.push(r.original.identifier))

              UUIDs = UUIDsACopiar.join(", ")

              navigator.clipboard.writeText(UUIDs)
            }}
          >
            Copiar IDs
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              let archivosACopiar: Task["file_name"][] = []
              let fileNames: Task["file_name"] = ""
              table
                .getSelectedRowModel()
                .rows.map(r => archivosACopiar.push(r.original.file_name))

              fileNames = archivosACopiar.join(", ")

              navigator.clipboard.writeText(fileNames)
            }}
          >
            Copiar nombres de archivo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              alert(
                `Está a punto de abrir ${
                  table.getSelectedRowModel().rows.length
                } pestañas`
              )
            }}
          >
            Abrir en nueva pestaña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              console.log(
                table
                  .getSelectedRowModel()
                  .rows.map(r => `borrar: ${r.original.identifier}`)
              )
            }}
            className='mx-2 my-1.5 p-0'
          >
            <DeleteButton
              ids={table
                .getSelectedRowModel()
                .rows.map(r => r.original.identifier)}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* TODO: implementar funcionalidad */}
          <Button
            variant='outline'
            className='ml-2 h-8 w-fit space-x-2 font-normal'
            onClick={event => event.stopPropagation()}
          >
            <span>Vista</span>
            <MixerHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  )
}
