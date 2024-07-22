"use client"
import { ReactNode, useState } from "react"

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
  Table as ReactTableInstance,
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
} from "@/components/ui/dropdown-menu"
import DeleteButton from "@/components/delete-button"

interface DataTableProps<TData, TValue, DataType> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  type: DataType
}

const POSSIBLE_TYPES = ["tasks", "records"]

export default function DataTable<TData, TValue, DataType>({
  columns,
  data,
  type,
}: DataTableProps<TData, TValue, DataType>) {
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

  const pageSizeOptions = [10, 20, 30, 40, 50]

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
  })

  return (
    <>
      <div className=''>
        <TableActions
          table={table as ReactTableInstance<TData>}
          type={type as string}
        />
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  <TableHead className='text-center'>
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
                      <span className='sr-only'>
                        Seleccionar todos los {`${type}`}
                      </span>
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
            <TableBody>
              <TableRows
                table={table as ReactTableInstance<TData>}
                columns={columns}
                type={type as string}
              />
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-between space-x-2 py-4'>
          <div className='flex-1 text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} filas seleccionadas.
          </div>

          {/* componente de pagination */}
          <div className='flex flex-row flex-1 font-bold items-center'>
            <span className='text-sm'>{`${type}`} por página </span>
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
                    placeholder={`Cantidad de ${type}...`}
                    className='w-full text-sm text-left border-0 focus-visible:ring-0'
                    value={inputValue}
                    onChange={event => {
                      setInputValue(event.target.value)
                      const customValue = Number(event.target.value)
                      if (
                        !isNaN(customValue) &&
                        customValue > 0 &&
                        customValue <= 100
                      ) {
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
          {/* componente de pagination count */}
          {/* TODO: cambiar por botones con numero de pagina navegables */}
          <div className='items-center text-sm font-bold pr-2'>
            <span>Página </span>
            <span>{table.getState().pagination.pageIndex + 1}</span>
            <span> de </span>
            <span>{table.getPageCount()}</span>
          </div>
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
      </div>
    </>
  )
}

interface SearchInputProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
}

export function SearchInput<TData>({ table, type }: SearchInputProps<TData>) {
  if (type === "tasks") {
    return (
      <Input
        placeholder='Filtrar por ID...'
        value={table.getColumn("identifier")?.getFilterValue() as string}
        onChange={event => {
          table.getColumn("identifier")?.setFilterValue(event.target.value)
        }}
        className='max-w-sm h-8'
      />
    )
  }

  if (type === "records") {
    return (
      <Input
        placeholder='Filtrar por ID de llamado...'
        value={table.getColumn("IDLLAMADA")?.getFilterValue() as string}
        onChange={event => {
          table.getColumn("IDLLAMADA")?.setFilterValue(event.target.value)
        }}
        className='max-w-sm h-8'
      />
    )
  }
}

interface TableActionsProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
}

export function TableActions<TData>({ table, type }: TableActionsProps<TData>) {
  "use client"
  return (
    <div className='flex pb-2 items-center w-full justify-between'>
      <SearchInput table={table} type={type} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='mr-auto ml-2 h-8 w-fit space-x-1 font-medium border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-xs border-dashed '
          >
            <CirclePlus size={GLOBAL_ICON_SIZE} />
            <span>{type === "tasks" ? "Estado" : "Usuario"}</span>
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
          {type === "tasks" ? (
            <DropdownMenuItem
              onClick={() => {
                console.log(
                  table
                    .getSelectedRowModel()
                    .rows.map((r: any) => r.original.identifier)
                )
              }}
            >
              Reintentar transcripción
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => {
              let UUIDsACopiar: string[] = []
              let UUIDs: string = ""
              table.getSelectedRowModel().rows.map((r: any) => {
                if (!!r.original.identifier) {
                  UUIDsACopiar.push(r.original.identifier)
                }
                if (!!r.original.id) {
                  UUIDsACopiar.push(r.original.IDLLAMADA)
                }
              })

              UUIDs = UUIDsACopiar.join(", ")
              if (typeof window !== "undefined" && navigator.clipboard) {
                // Safe to use navigator.clipboard.writeText GPT
                navigator.clipboard
                  .writeText(UUIDs)
                  .then(() => {
                    console.log("Text copied to clipboard")
                  })
                  .catch(err => {
                    console.error("Failed to copy text to clipboard", err)
                  })
              } else {
                console.warn(
                  "Clipboard API not supported or not running in client-side"
                )
              }
            }}
          >
            Copiar IDs
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              let archivosACopiar: string[] = []
              let fileNames: string = ""
              table.getSelectedRowModel().rows.map((r: any) => {
                if (!!r.original.file_name) {
                  archivosACopiar.push(r.original.file_name)
                }
                if (!!r.original.GRABACION) {
                  archivosACopiar.push(r.original.GRABACION)
                }
              })

              fileNames = archivosACopiar.join(", ")
              if (typeof window !== "undefined" && navigator.clipboard) {
                // Safe to use navigator.clipboard.writeText GPT
                navigator.clipboard
                  .writeText(fileNames)
                  .then(() => {
                    console.log("Text copied to clipboard")
                  })
                  .catch(err => {
                    console.error("Failed to copy text to clipboard", err)
                  })
              } else {
                console.warn(
                  "Clipboard API not supported or not running in client-side"
                )
              }
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
          {type === "tasks" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={e => {
                  e.preventDefault()
                  const event = new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                  document
                    .getElementById(`delete-button-${type}`)
                    ?.dispatchEvent(event)
                }}
              >
                <DeleteButton
                  identifier={type}
                  ids={table
                    .getSelectedRowModel()
                    .rows.map((r: any) => r.original.identifier)}
                />
              </DropdownMenuItem>
            </>
          ) : null}
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

interface TableRowsProps<TData> {
  table: ReactTableInstance<TData>
  columns: ColumnDef<TData, any>[]
  type?: string
}

export function TableRows<TData>({
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
            className='hover:bg-secondary p-2'
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
              <TableCell key={`cell-${cell.id}`}>
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
          No se encontraron {type === "tasks" ? "tareas" : "grabaciones"}
          ...
        </TableCell>
      </TableRow>
    )
  }
}
