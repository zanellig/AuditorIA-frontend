"use client"

import { Table as ReactTableInstance } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { MixerHorizontalIcon, Pencil1Icon } from "@radix-ui/react-icons"

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
import SearchInput from "@/components/tables/table-core/search-input"

import { useToast } from "@/components/ui/use-toast"
import SeleccionadorEstadoUsuario from "@/components/tables/table-core/seleccionador-estado-usuario"

interface TableActionsProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
}

export default function TableActions<TData>({
  table,
  type,
}: TableActionsProps<TData>) {
  "use client"
  const { toast } = useToast()
  return (
    <div className='flex pb-2 items-center w-full justify-between'>
      <SearchInput table={table} type={type} />
      {/* <DropdownMenu>
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
          <DropdownMenuItem>WIP</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}

      <SeleccionadorEstadoUsuario table={table} type={type} />

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
                alert(
                  `Está a punto de abrir ${
                    table.getSelectedRowModel().rows.length
                  } pestañas`
                )
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
        <DropdownMenuContent>
          <DropdownMenuItem>WIP</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
