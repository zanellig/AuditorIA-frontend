"use client"

import { ColumnDef, Row, Table } from "@tanstack/react-table"
import { Task } from "@/lib/types"

import {
  ArrowUpDown,
  MoreHorizontal,
  CircleCheck,
  CircleDashed,
  CircleAlert,
  ArrowDown,
  ArrowUp,
  BrainCircuitIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

import DeleteButton from "@/components/delete-button"

import type { Status } from "@/lib/types"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { handleCopyToClipboard, getLocaleMonth } from "@/lib/utils"

import { secondsToHMS, formatTimestamp } from "@/lib/utils"
import Link from "next/link"

import ButtonBorderMagic from "@/components/ui/button-border-magic"
import { API_CANARY } from "@/lib/consts"
import { actionRevalidatePath, analyzeTask } from "@/lib/actions"
import { ToastAction } from "@/components/ui/toast"
import { usePathname } from "next/navigation"
import A from "@/components/typography/a"

function renderMarker(status: Status) {
  switch (status) {
    case "completed":
    case "analyzed":
      return <CircleCheck size={GLOBAL_ICON_SIZE} className='text-green-500' />
    case "processing":
      return (
        <CircleDashed
          size={GLOBAL_ICON_SIZE}
          className='text-muted-foreground'
        />
      )
    case "failed":
      return <CircleAlert size={GLOBAL_ICON_SIZE} className='text-red-500' />
  }
}

function renderArrow(sorted: false | "asc" | "desc") {
  if (sorted === false) {
    return <ArrowUpDown className='ml-2 h-4 w-4' />
  } else if (sorted === "asc") {
    return <ArrowDown className='ml-2 h-4 w-4' />
  } else if (sorted === "desc") {
    return <ArrowUp className='ml-2 h-4 w-4' />
  }
}
/**
 * Don't export or use this function more than it's needed. It's only a helper function to centralize the URL building in this file
 */
function _URLBuilder(task: Task) {
  const taskURL = `/dashboard/transcription?identifier=${task?.identifier}${
    task?.file_name ? `&file_name=${task?.file_name}` : ""
  }`
  return taskURL
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
          <Link href={_URLBuilder(row?.original as Task)}>
            <A>{slicedID}</A>
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
    header: ({ column }) => {
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
      const task = row.original
      const { toast } = useToast()
      const currentUrl = usePathname()
      const taskURL = _URLBuilder(task as Task)
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
                <ButtonBorderMagic
                  className='w-full h-full text-start'
                  id={row.original?.identifier}
                  onClick={async () => {
                    toast({
                      title: "Analizando tarea",
                      description: "La tarea se está analizando",
                      variant: "default",
                    })
                    const [err, res] = await analyzeTask(
                      [API_CANARY, "tasks"],
                      row.original?.identifier,
                      row.original?.language
                    )
                    console.log(res)
                    if (err !== null) {
                      toast({
                        title: "Error",
                        description: "La tarea no pudo ser analizada",
                        variant: "destructive",
                      })
                    }
                    if (res) {
                      toast({
                        title: "Tarea analizada",
                        description: `Ya puede visualizar el análisis de la tarea ${row.original?.identifier}`,
                        variant: "success",
                        action: (
                          <ToastAction altText='Ir a la transcripción'>
                            <Link
                              href={taskURL}
                              className='w-full h-full cursor-default'
                              onClick={() => {
                                actionRevalidatePath(taskURL)
                              }}
                            >
                              Ir a la transcripción
                            </Link>
                          </ToastAction>
                        ),
                      })
                    }

                    actionRevalidatePath(currentUrl)
                  }}
                >
                  Analizar
                </ButtonBorderMagic>
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

              <DropdownMenuItem
                onClick={() => {
                  handleCopyToClipboard(task?.identifier as Task["identifier"])
                  toast({
                    title: "ID copiado",
                    description: task?.identifier,
                  })
                }}
              >
                Copiar ID
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  handleCopyToClipboard(task?.file_name as Task["identifier"])
                  toast({
                    title: "Nombre de archivo copiado",
                    description: task?.file_name,
                  })
                }}
              >
                Copiar nombre del archivo
              </DropdownMenuItem>

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
