"use client"
import type { ColumnDef, Row } from "@tanstack/react-table"
import type { Recording } from "@/lib/types"

import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  BrainCircuitIcon,
  InfoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { obtenerMesLocale } from "@/lib/utils"
import { _urlBase, _urlCanary } from "@/lib/api/paths"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ParagraphP from "@/components/typography/paragraphP"
import TranscriptionButton from "@/components/tables/records-table/transcription-button.server"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// function renderMarker(status: Status) {
//   switch (status) {
//     case "completed":
//     case "analyzed":
//       return <CircleCheck size={GLOBAL_ICON_SIZE} className='text-green-500' />
//     case "processing":
//       return (
//         <CircleDashed
//           size={GLOBAL_ICON_SIZE}
//           className='text-muted-foreground'
//         />
//       )
//     case "failed":
//       return <CircleAlert size={GLOBAL_ICON_SIZE} className='text-red-500' />
//   }
// }

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
  /**
   * TODO: add a ID column with a Badge component showing the type of task
   * TODO: Función para seleccionar UUID con un toggle, y seleccionar masivamente. Si no está seleccionado e igual se toca ELIMINAR, mandar a eliminar el UUID
   */
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
          {/* <InfoIcon
            className='ml-2 mr-0 inline-block'
            size={GLOBAL_ICON_SIZE}
          /> */}
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
        <div className='flex flex-row justify-between items-center text-primary text-start space-x-2 w-fit'>
          {/* {renderMarker(row.original?.USUARIO as Record["USUARIO"])} */}
          <div className='font-bold capitalize'>
            {row.original?.USUARIO as Recording["USUARIO"]}
          </div>
        </div>
      )
    },
  },
  // {
  //   accessorKey: "DIRECCION",
  //   header: () => <div>Dirección</div>,
  //   cell: ({ row }) => {
  //     return (
  //       <div className='capitalize'>
  //         {row.original?.DIRECCION.toLocaleLowerCase()}
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "INICIO",
    header: () => <div>Fecha</div>,
    cell: ({ row }) => {
      const date = new Date(row.original?.INICIO as Recording["INICIO"])
      const mes = obtenerMesLocale(date.getMonth())

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
      return <div className='text-center'></div>
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-row space-x-2  justify-center'>
          <TranscriptionButton row={row as Row<Recording>} />
        </div>
      )
    },
  },
]
