"use client"

import { useMemo, useState } from "react"
import {
  Table as ReactTableInstance,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import SearchInput from "@/components/tables/table-core/search-input"
import FilterButton from "@/components/tables/table-core/filter-button"

interface TableActionsProps<TData> {
  children?: React.ReactNode
  table: ReactTableInstance<TData>
  data: TData[]
}

export default function TableActions<TData>({
  children,
  table,
  data,
}: TableActionsProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = table.getAllColumns()

  // Memoized filter logic
  const filters = useMemo(
    () =>
      columns
        .filter(column => column.getCanFilter())
        .map(column => {
          const id = column.id
          const uniqueValues = new Set(
            data
              .map(row => {
                const value = row[id as keyof TData]
                return value !== null && value !== undefined
                  ? String(value)
                  : null
              })
              .filter(Boolean)
          )
          return { id, filterValues: uniqueValues }
        }),
    [columns, data]
  )

  // Update table options
  useMemo(() => {
    table.setOptions(prev => ({
      ...prev,
      state: {
        ...prev.state,
        columnFilters,
      },
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }))
  }, [table, columnFilters])

  return (
    <div className='flex pb-2 items-center w-full justify-between'>
      <div className='flex flex-row space-x-2'>
        <SearchInput<TData> table={table} />
        {filters.map(
          filter =>
            table.getColumn(filter.id)?.getCanFilter() && (
              <FilterButton<TData>
                key={filter.id}
                table={table}
                // we ignore the errors because we already checked if the column exists and can be filtered
                // @ts-ignore
                column={table.getColumn(filter.id)}
                // @ts-ignore
                filterValues={filter.filterValues}
              />
            )
        )}
        {children}
      </div>
    </div>
  )
}

/*
      <div className='flex flex-row space-x-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
                    table.getSelectedRowModel().rows.map((r: any) => r.original)
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
                  if (r.original?.identifier) {
                    UUIDsACopiar.push(r.original.identifier)
                  }
                  if (r.original?.id) {
                    UUIDsACopiar.push(r.original.IDLLAMADA)
                  }
                })

                UUIDs = UUIDsACopiar.join(", ")
                if (typeof window !== "undefined" && navigator.clipboard) {
                  // Safe to use navigator.clipboard.writeText GPT
                  navigator.clipboard
                    .writeText(UUIDs)
                    .then(() => {
                      toast({ title: "IDs copiados al portapapeles" })
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
                  if (r.original?.file_name) {
                    archivosACopiar.push(r.original.file_name)
                  }
                  if (r.original?.GRABACION) {
                    archivosACopiar.push(r.original.GRABACION)
                  }
                })

                fileNames = archivosACopiar.join(", ")
                if (typeof window !== "undefined" && navigator.clipboard) {
                  // Safe to use navigator.clipboard.writeText GPT
                  navigator.clipboard
                    .writeText(fileNames)
                    .then(() =>
                      toast({
                        title: "Nombres de archivo copiados al portapapeles",
                      })
                    )
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
            {type === "tasks" ? (
              <DropdownMenuItem
                onClick={() => {
                  table.getSelectedRowModel().rows.map((r: any) => {
                    window.open(
                      `http://10.20.30.211:3001/dashboard/transcription?identifier=${r.original.identifier}`,
                      "_blank",
                      "popup=true,width=800,height=600"
                    )
                  })
                  table.toggleAllRowsSelected(false)
                }}
              >
                Abrir en nueva pestaña
              </DropdownMenuItem>
            ) : null}
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
                  <DeleteButton<TData>
                    identifier={type}
                    ids={table
                      .getSelectedRowModel()
                      .rows.map((r: any) => r.original.identifier)}
                    table={table as typeof table}
                  />
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            TODO: implementar funcionalidad
            <Button
              variant='outline'
              className='ml-2 h-8 w-fit space-x-2 font-normal'
              onClick={event => event.stopPropagation()}
            >
              <span>Vista</span>
              <MixerHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>WIP</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
*/
