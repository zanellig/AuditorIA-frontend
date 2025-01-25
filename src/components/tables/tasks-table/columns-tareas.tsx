import * as React from "react"
import { ColumnDef, Row, Table } from "@tanstack/react-table"
import { Task } from "@/lib/types"
import { ArrowUpDown, MoreHorizontal, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteButton from "@/components/tables/tasks-table/delete-button"
import type { Status } from "@/lib/types"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { getLocaleMonth, _URLBuilder } from "@/lib/utils"
import { secondsToHMS, formatTimestamp } from "@/lib/utils"
import Link from "next/link"
import { actionRevalidatePath } from "@/lib/actions"
import AnalyzeButton from "./analyze-button"
import { CopyValueDropdownItem } from "./copy-value-dropdown-item"
import { renderMarker } from "@/components/tables/marker-renderer"

function renderArrow(sorted: false | "asc" | "desc") {
  if (sorted === false) {
    return <ArrowUpDown className='ml-2 h-4 w-4' />
  } else if (sorted === "asc") {
    return <ArrowDown className='ml-2 h-4 w-4' />
  } else if (sorted === "desc") {
    return <ArrowUp className='ml-2 h-4 w-4' />
  }
}

export const columns: ColumnDef<Task | null>[] = [
  /**
   * TODO: add a ID column with a Badge component showing the type of task
   * TODO: Función para seleccionar UUID con un toggle, y seleccionar masivamente. Si no está seleccionado e igual se toca ELIMINAR, mandar a eliminar el UUID
   * TODO: agregar data del promedio análisis si existe y estilar condicionalmente por threshold : osea si el task_type es el que corresponde al análisis, renderizar un row{} con los datos
   */
  {
    accessorKey: "identifier",
    header: () => {
      return <div className='text-start'>ID</div>
    },
    cell: ({ row }) => {
      const ID = row.original?.identifier as Task["identifier"]
      const slicedID = `${ID.slice(0, 6)}...`

      return (
        <div key={`check-${row.original?.identifier}`}>
          <Link
            href={_URLBuilder(row?.original as Task)}
            className='font-medium text-primary underline underline-offset-4'
          >
            {slicedID}
          </Link>
        </div>
      )
    },
  },

  {
    accessorKey: "status",
    header: () => {
      return <div className='text-start'>Estado</div>
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-row justify-between items-center text-start space-x-2 w-fit'>
          {renderMarker(row.original?.status as Status)}
          <div className='font-bold capitalize'>
            {row.original?.status as Status}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div>Fecha</div>,
    cell: ({ row }) => {
      const date = new Date(row.original?.created_at as Task["created_at"])
      const mes = getLocaleMonth(date.getMonth())
      const hora = date.toLocaleTimeString("es-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      return (
        <div>{`${date.getDate()} de ${mes} de ${date.getFullYear()} ${hora}`}</div>
      )
    },
  },
  {
    accessorKey: "file_name",
    header: ({ column }) => {
      return (
        <div>
          <div
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc")
            }}
            className='flex flex-row justify-between items-center text-start space-x-2 w-fit rounded-sm hover:text-primary hover:cursor-pointer hover:bg-secondary p-2'
          >
            Nombre del archivo {renderArrow(column.getIsSorted())}
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div>{row.original?.file_name}</div>
    },
  },
  {
    accessorKey: "audio_duration",
    header: () => {
      return <div>Duración</div>
    },
    cell: ({ row }) => {
      const timestamp = secondsToHMS(
        row.original?.audio_duration as Task["audio_duration"]
      )
      const formattedTS = formatTimestamp(timestamp, true)
      return <div>{formattedTS}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const task = row.original as Task
      const taskURL = _URLBuilder(row.original as Task)
      return (
        <div className='flex flex-row justify-end space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0 '>
                <span className='sr-only'>Abrir menu</span>
                <MoreHorizontal size={GLOBAL_ICON_SIZE} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem className='p-0'>
                <AnalyzeButton
                  row={row as Row<Task>}
                  table={table as Table<Task>}
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  row.pin("top", true)
                }}
              >
                Fijar fila
              </DropdownMenuItem>

              <DropdownMenuItem className='font-bold'>
                <Link
                  href={taskURL}
                  className='w-full h-full cursor-default'
                  onClick={() => {
                    actionRevalidatePath(taskURL)
                  }}
                >
                  Ir a la transcripción
                </Link>
              </DropdownMenuItem>

              <CopyValueDropdownItem
                value={task?.identifier}
                label='ID'
                showToast
              />
              <CopyValueDropdownItem
                value={task?.file_name}
                label='nombre del archivo'
                showToast
              />

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
                    .getElementById(`delete-button-${task?.identifier}`)
                    ?.dispatchEvent(event)
                }}
              >
                <DeleteButton
                  identifier={task?.identifier}
                  table={table as typeof table}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
