"use client"
import { useState } from "react"

import {
  PaginationState,
  Table as ReactTableInstance,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CaretSortIcon,
  CheckIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { actionRevalidatePath } from "@/lib/actions"

export default function Pagination<TData>({
  table,
  type,
  pagination,
}: {
  table: ReactTableInstance<TData>
  type: string
  pagination: PaginationState
}) {
  const [inputValue, setInputValue] = useState<string>("") // Estado para el valor del input
  const pageSizeOptions = [10, 20, 30, 40, 50]
  return (
    <div className='flex items-center justify-between space-x-2 py-4'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} de{" "}
        {table.getFilteredRowModel().rows.length} filas seleccionadas.
      </div>

      {/* componente de pagination */}
      <div className='flex flex-row flex-1 font-bold items-center'>
        <span className='text-sm'>
          <span className='capitalize'>
            {`${type === "tasks" ? "Tareas" : "Grabaciones"} `}
          </span>
          por página{" "}
        </span>
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
                placeholder={`Cantidad de ${
                  type === "tasks" ? "tareas" : "grabaciones"
                }...`}
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
        onClick={async () => {
          table.firstPage()
          await actionRevalidatePath("/dashboard")
        }}
        disabled={!table.getCanPreviousPage()}
      >
        <DoubleArrowLeftIcon />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={async () => {
          table.previousPage()
          await actionRevalidatePath("/dashboard")
        }}
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
        onClick={async () => {
          table.nextPage()
          await actionRevalidatePath("/dashboard")
        }}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRightIcon />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={async () => {
          table.lastPage()
          await actionRevalidatePath("/dashboard")
        }}
        disabled={!table.getCanNextPage()}
      >
        <DoubleArrowRightIcon />
      </Button>
    </div>
  )
}
