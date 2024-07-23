"use client"
import { ColumnDef } from "@tanstack/react-table"
import type { Recording } from "@/lib/types"

import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  BrainCircuitIcon,
  CaptionsIcon,
  InfoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { obtenerMesLocale } from "@/lib/utils"
import { RecordingsAPI, TranscriptionsAPI } from "@/lib/actions"
import { _urlBase, _urlCanary } from "@/lib/api/paths"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ParagraphP from "@/components/typography/paragraphP"

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
      if (row.original) {
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
    header: () => {
      return <div className='text-center'>Acciones</div>
    },
    cell: ({ row }) => {
      // const transcribeTaskAPI = new TasksAPI(_urlBase, "/speech-to-text-url")
      // const alignTaskAPI = new TasksAPI(_urlBase, "/service/align")
      // const diarizeTaskAPI = new TasksAPI(_urlBase, "/service/diarize")
      // const combineTaskAPI = new TasksAPI(_urlBase, "/service/combine")

      return (
        <div className='flex flex-row space-x-2  justify-center'>
          <Sheet>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button
                      id={`button-deploy-transcribe-${row.original?.URL}`}
                      variant='outline'
                    >
                      <CaptionsIcon
                        size={GLOBAL_ICON_SIZE + 4}
                        strokeWidth={2}
                      />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <ParagraphP>Transcribir audio</ParagraphP>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <SheetContent side={"left"} className='flex flex-col'>
              <SheetHeader>
                <SheetTitle>
                  <div className='flex flex-row text-start items-center space-x-2'>
                    <CaptionsIcon /> <span>Opciones de transcripción</span>
                  </div>
                </SheetTitle>
                <SheetDescription>
                  Si conoce estas opciones, puede seleccionar los parámetros que
                  le parezcan convenientes. En caso de no saber lo que
                  significan estas casillas, puede dejarlas vacías.
                </SheetDescription>
              </SheetHeader>
              <Select>
                <Label htmlFor='language'>Idioma</Label>
                <SelectTrigger className='w-[250px]'>
                  <SelectValue
                    id='language'
                    placeholder='Seleccione el idioma...'
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='es'>Español</SelectItem>
                    <SelectItem value='en'>Inglés</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <Label htmlFor='task-type'>Tipo de tarea</Label>
                <SelectTrigger className='w-[250px]'>
                  <SelectValue
                    id='task-type'
                    placeholder='Seleccione el tipo de tarea...'
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='transcribe'>Transcribir</SelectItem>
                    <SelectItem value='align'>Alinear transcripción</SelectItem>
                    <SelectItem value='diarize'>Separar canales</SelectItem>
                    <SelectItem value='combine'>
                      Separar canales y transcribir
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <Label htmlFor='model'>Modelo</Label>
                <SelectTrigger className='w-[250px]'>
                  <SelectValue
                    id='model'
                    placeholder='Seleccione el modelo de IA...'
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='large-v3'>
                      <span className='font-bold'>Large V3 </span>
                      <span className='font-thin'> (recomendado)</span>
                    </SelectItem>
                    <SelectItem value='tiny'>Tiny</SelectItem>
                    <SelectItem value='tiny.en'>Tiny EN</SelectItem>
                    <SelectItem value='base'>Base</SelectItem>
                    <SelectItem value='base.en'>Base EN</SelectItem>
                    <SelectItem value='small'>Small</SelectItem>
                    <SelectItem value='small.en'>Small EN</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='medium.en'>Medium EN</SelectItem>
                    <SelectItem value='large'>Large</SelectItem>
                    <SelectItem value='large-v1'>Large V1</SelectItem>
                    <SelectItem value='large-v2'>Large V2</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button>Iniciar tarea</Button>
            </SheetContent>
          </Sheet>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline'>
                  <BrainCircuitIcon
                    size={GLOBAL_ICON_SIZE + 4}
                    strokeWidth={2}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <ParagraphP>Analizar sentimiento</ParagraphP>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
