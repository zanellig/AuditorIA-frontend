"use client"
import React from "react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import type { Recording } from "@/lib/types"
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import { getLocaleMonth } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AudioProcessingTaskStarter from "./audio-processing/audio-processing-task-starter"


function renderArrow(sorted: false | "asc" | "desc") {
  if (sorted === false) {
    return <ArrowUpDown className='ml-2 h-4 w-4' />
  } else if (sorted === "asc") {
    return <ArrowDown className='ml-2 h-4 w-4' />
  } else if (sorted === "desc") {
    return <ArrowUp className='ml-2 h-4 w-4' />
  }
}

export const columns: ColumnDef<Recording | null>[] = [
  {
    accessorKey: "IDLLAMADA",
    header: () => {
      return <div>Ticket</div>
    },
    cell: ({ row }) => {
      if (row.original) {
        row.original.IDLLAMADA = String(row.original.IDLLAMADA)
      }
      return (
        <div
          key={`check-${row.original?.IDLLAMADA}`}
          className='flex flex-row items-center justify-start w-fit space-x-2'
        >
          <Badge className='capitalize' variant={"outline"}>
            {row.original?.DIRECCION.toLocaleLowerCase()}
          </Badge>
          <div className='w-20'>
            {row.original?.IDLLAMADA as Recording["IDLLAMADA"]}
          </div>
        </div>
      )
    },
  },
  {
    /**
     * Campaña
     */
    accessorKey: "IDAPLICACION",
    header: () => {
      return <div className='text-start'>Campaña</div>
    },
    cell: ({ row }) => {
      return (
        <div>{row.original?.IDAPLICACION as Recording["IDAPLICACION"]}</div>
      )
    },
  },
  {
    accessorKey: "USUARIO",
    header: () => {
      return <div className='text-start'>Usuario</div>
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-row justify-between items-center text-start space-x-2 w-fit'>
          {/* {renderMarker(row.original?.USUARIO as Record["USUARIO"])} */}
          <div className='font-bold capitalize'>
            {row.original?.USUARIO as Recording["USUARIO"]}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "INICIO",
    header: () => <div>Fecha</div>,
    cell: ({ row }) => {
      const date = new Date(row.original?.INICIO as Recording["INICIO"])
      const mes = getLocaleMonth(date.getMonth())

      return <div>{`${date.getDate()} de ${mes} de ${date.getFullYear()}`}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div>Hora</div>,
    cell: ({ row }) => {
      const date = new Date(row.original?.INICIO as Recording["INICIO"])
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
    accessorKey: "GRABACION",
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
      return <div>{row.original?.GRABACION}</div>
    },
  },
  {
    accessorKey: "URL",
    header: () => {
      return <></>
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-row space-x-2  justify-center'>
          <AudioProcessingTaskStarter row={row as Row<Recording>} />
        </div>
      )
    },
  },
]
