"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@/lib/tasks"

import {
  ArrowUpDown,
  MoreHorizontal,
  CircleCheck,
  CircleDashed,
  CircleAlert,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import DeleteButton from "@/components/DeleteButton"

import type { Status } from "@/lib/tasks"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import Link from "next/link"

function renderMarker(status: Status) {
  switch (status) {
    case "completed":
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

export const columns: ColumnDef<Task>[] = [
  /**
   * TODO: add a ID column with a Badge component showing the type of task
   * TODO: Función para seleccionar UUID con un toggle, y seleccionar masivamente. Si no está seleccionado e igual se toca ELIMINAR, mandar a eliminar el UUID
   */
  {
    accessorKey: "identifier",
    header: () => {
      return <div className='text-start'>ID</div>
    },
    cell: ({ row }) => {
      return (
        <div className=''>{row.original.identifier as Task["identifier"]}</div>
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
        <div className='flex flex-row justify-between items-center text-primary text-start space-x-2 w-fit'>
          {renderMarker(row.original.status)}
          <div className='font-bold capitalize'>
            {row.original.status as Status}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div>Fecha</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      const mes = obtenerMesLocale(date.getMonth())

      return <div>{`${date.getDate()} de ${mes} de ${date.getFullYear()}`}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div>Hora</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      const hora = date.toLocaleTimeString("es-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      return <div>{hora}</div>
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
      return <div>{row.original.file_name.toLocaleUpperCase()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tarea = row.original

      return (
        <div className='mr-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Abrir menu</span>
                <MoreHorizontal size={GLOBAL_ICON_SIZE} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem className='font-bold'>
                <Link
                  href={`/dashboard/transcription?search=${tarea.identifier}`}
                  className='w-full h-full cursor-default'
                >
                  Ir a la transcripción
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(tarea.identifier)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(tarea.file_name)}
              >
                Copiar nombre del archivo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DeleteButton id={tarea.identifier} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function obtenerMesLocale(mes: number): string {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return meses[mes - 1]
}
