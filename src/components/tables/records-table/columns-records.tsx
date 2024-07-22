"use client"
import { useOptimistic } from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { Task, Recording, Status } from "@/lib/types"

import {
  ArrowUpDown,
  MoreHorizontal,
  CircleCheck,
  CircleDashed,
  CircleAlert,
  ArrowDown,
  ArrowUp,
  BrainCircuitIcon,
  NfcIcon,
  CaptionsIcon,
  InfoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import DeleteButton from "@/components/delete-button"
import Transcription from "@/components/unused.transcription"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import Link from "next/link"
import { obtenerMesLocale } from "@/lib/utils"
import { RecordingsAPI, TasksAPI, TranscriptionsAPI } from "@/lib/actions"
import { _urlBase } from "@/lib/api/paths"

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
      return <div>Detalles</div>
    },
    cell: ({ row }) => {
      if (!!row.original) {
        row.original.IDLLAMADA = String(row.original.IDLLAMADA)
      }
      return (
        <div
          key={`check-${row.original?.IDLLAMADA}`}
          className='flex flex-row items-center'
        >
          {row.original?.IDLLAMADA as Recording["IDLLAMADA"]}
          <InfoIcon className='ml-2' size={GLOBAL_ICON_SIZE} />
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
    header: ({ column }) => {
      return <div className='text-center'>Acciones</div>
    },
    cell: ({ row }) => {
      // const transcribeTaskAPI = new TasksAPI(_urlBase, "/speech-to-text-url")
      // const alignTaskAPI = new TasksAPI(_urlBase, "/service/align")
      // const diarizeTaskAPI = new TasksAPI(_urlBase, "/service/diarize")
      // const combineTaskAPI = new TasksAPI(_urlBase, "/service/combine")

      return (
        <div className='flex flex-row space-x-2  justify-center'>
          <Button
            id={`button-transcribe-${row.original?.URL}`}
            variant='outline'
            onClick={event => {
              event.preventDefault()
              // transcribeTaskAPI.createTask(row.original?.URL as string)
            }}
          >
            <CaptionsIcon size={GLOBAL_ICON_SIZE + 4} strokeWidth={2} />
          </Button>
          <Button variant='outline'>
            <BrainCircuitIcon size={GLOBAL_ICON_SIZE + 4} strokeWidth={2} />
          </Button>
          <Button variant='outline'>
            <NfcIcon size={GLOBAL_ICON_SIZE + 4} strokeWidth={2} />
          </Button>
        </div>
      )
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const record = row.original

  //     // {
  //     //   "identifier": "9b5113b1-47f4-4850-a978-3df81dc95489",
  //     //   "status": "Analyzed",
  //     //   "task_type": "full_process",
  //     //   "file_name": "12410-14726091-20240307133302.mp3",
  //     //   "language": "es",
  //     //   "audio_duration": 785.58,
  //     //   "created_at": "2024-07-17T04:47:22"
  //     // }

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant='ghost' className='h-8 w-8 p-0 '>
  //             <span className='sr-only'>Abrir menu</span>
  //             <MoreHorizontal size={GLOBAL_ICON_SIZE} />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align='end'>
  //           <DropdownMenuItem className='font-bold'>
  //             <Link
  //               href={`/dashboard/transcription?search=${record?.}`}
  //               className='w-full h-full cursor-default'
  //             >
  //               Ir a la transcripción
  //             </Link>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem
  //             onClick={() =>
  //               navigator.clipboard.writeText(
  //                 record?.identifier as Task["identifier"]
  //               )
  //             }
  //           >
  //             Copiar ID
  //           </DropdownMenuItem>
  //           <DropdownMenuItem
  //             onClick={() =>
  //               navigator.clipboard.writeText(
  //                 record?.file_name as Task["identifier"]
  //               )
  //             }
  //           >
  //             Copiar nombre del archivo
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>
  //             <DeleteButton id={record?.identifier} />
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     )
  //   },
  // },
]
