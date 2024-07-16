"use client"
import { useState } from "react"

// import { useDebounce, useDebouncedCallback } from "use-debounce"

import { cn } from "@/lib/utils"

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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
            <>
              <TableRow
                key={row.id}
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
                  <>
                    <TableCell
                      key={cell.id}
                      className={
                        i === row.getVisibleCells().length - 1
                          ? "text-end"
                          : "text-start" + " "
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  </>
                ))}
              </TableRow>
            </>
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
      <div className='flex py-4 items-center w-full justify-between'>
        <Input
          placeholder='Buscar transcripción por nombre de archivo...'
          value={
            (table.getColumn("file_name")?.getFilterValue() as string) ?? ""
          }
          onChange={event =>
            table.getColumn("file_name")?.setFilterValue(event.target.value)
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
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='secondary'
              className=' h-8 w-fit space-x-2 font-normal'
              onClick={event => event.stopPropagation()}
            >
              <span>Acciones en masa</span>
              <Pencil1Icon />
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
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
                    key={header.id}
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

        {/* test componente de pagination 2 */}
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
                  key={pageSize}
                  onClick={() => {
                    table.setPageSize(pageSize)
                    setInputValue("")
                  }}
                  // onSelect={currentValue => {
                  //   table.setPageSize(Number(currentValue))
                  //   // setOpen(false)
                  // }}
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
        {/* componente de pagination
        <div className='flex flex-row flex-1 font-bold items-center'>
          <span className='text-sm '>Tareas por página </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                // aria-expanded={open}
                className='ml-2 w-fit justify-between'
              >
                {pagination.pageSize}
                <CaretSortIcon className='ml-2 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0'>
              <Command>
                <CommandInput placeholder='Cantidad de filas...' />
                <CommandEmpty>No se encontró tamaño.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {pageSizeOptions.map(pageSize => (
                      <CommandItem
                        key={pageSize}
                        value={String(pageSize)}
                        onSelect={currentValue => {
                          table.setPageSize(Number(currentValue))
                          // setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            pagination.pageSize === pageSize
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {pageSize}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div> */}

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
