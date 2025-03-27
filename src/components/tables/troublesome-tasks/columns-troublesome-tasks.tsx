"use client"
import { ColumnDef } from "@tanstack/react-table"
import { TasksRecordsResponse, TaskRecordsSearchParams } from "@/lib/types"
import Link from "next/link"
import {
  formatTimestamp,
  handleCopyToClipboard,
  secondsToHMS,
} from "@/lib/utils"
import A from "@/components/typography/a"
import { renderMarker } from "@/components/tables/marker-renderer"

import { type Status } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clipboard,
  Download,
  Ellipsis,
  Loader2,
  Sparkles,
  Trash,
  User,
  X,
} from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useToast } from "@/components/ui/use-toast"
import { useDeleteTaskMutation } from "@/lib/hooks/mutations/delete-task-mutation"
import { getHost } from "@/lib/actions"
import { useTasksRecords } from "@/lib/hooks/use-task-records"

const SortableHeader = ({
  field,
  label,
}: {
  field: NonNullable<TaskRecordsSearchParams["sortBy"]>
  label: string
}) => {
  const { filters, toggleSort } = useTasksRecords()
  const isActive = filters.sortBy === field
  const isAsc = isActive && filters.sortOrder === "asc"

  return (
    <Button
      variant='ghost'
      className='gap-2 w-full justify-center'
      onClick={() => toggleSort(field)}
    >
      <span>{label}</span>
      {isActive ? (
        isAsc ? (
          <ChevronUp size={GLOBAL_ICON_SIZE} />
        ) : (
          <ChevronDown size={GLOBAL_ICON_SIZE} />
        )
      ) : (
        <ChevronsUpDown size={GLOBAL_ICON_SIZE} />
      )}
    </Button>
  )
}

export const columns: ColumnDef<TasksRecordsResponse>[] = [
  {
    accessorKey: "uuid",
    header: () => (
      <div className='text-start'>
        <SortableHeader field='uuid' label='ID' />
      </div>
    ),
    cell: ({ row }) => {
      const ID = row.original?.uuid as TasksRecordsResponse["uuid"]
      const slicedID = `${ID.slice(0, 6)}...`

      return (
        <div key={`check-${row.original?.uuid}`} className='text-start'>
          <Link
            href={UrlBuilder({
              uuid: row.original?.uuid,
              file_name: row.original?.file_name,
            })}
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
    header: () => (
      <div>
        <SortableHeader field='status' label='Estado' />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className='flex gap-2 items-center justify-center'>
          {renderMarker(row.original?.status as Status)}
          <span className='font-bold capitalize'>{row.original?.status}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "user",
    header: () => (
      <div>
        <SortableHeader field='user' label='Agente' />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original?.user) {
        return <div>-</div>
      }
      return <span>{row.original?.user}</span>
    },
  },
  {
    accessorKey: "campaign",
    header: () => (
      <div>
        <SortableHeader field='campaign' label='Campaña' />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original?.campaign) {
        return <div>-</div>
      }
      return <A>{row.original?.campaign_name}</A>
    },
  },
  {
    accessorKey: "audio_duration",
    header: () => (
      <div>
        <SortableHeader field='audio_duration' label='Duración' />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original?.audio_duration) {
        return <div>-</div>
      }
      const timestamp = secondsToHMS(row.original?.audio_duration as number)
      const formattedTS = formatTimestamp({ ...timestamp, concat: true })
      return <div>{formattedTS}</div>
    },
  },
  {
    accessorKey: "inicio",
    header: () => (
      <div>
        <SortableHeader field='inicio' label='Fecha' />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original?.inicio) {
        return <div>-</div>
      }
      const date = new Date(row.original?.inicio)
      const formattedDate = date.toLocaleDateString("es-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      return <div>{formattedDate}</div>
    },
  },
  {
    accessorKey: "URL",
    header: () => {
      return <div>Audio</div>
    },
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        {row.original?.URL ? (
          <Check className='text-success' size={GLOBAL_ICON_SIZE} />
        ) : (
          <X className='text-destructive' size={GLOBAL_ICON_SIZE} />
        )}
      </div>
    ),
  },
  // {
  //   accessorKey: "tags",
  //   header: () => {
  //     return <div>Etiquetas</div>
  //   },
  //   cell: ({ row }) => {
  //     const tagsQuery = useTags({ uuid: row.original?.uuid as string })
  //     return (
  //       <div className='flex gap-2 justify-center items-center'>
  //         {tagsQuery.isPending && (
  //           <Loader2 size={GLOBAL_ICON_SIZE} className='animate-spin' />
  //         )}
  //         {tagsQuery.data?.tags?.map((tag: string, index: number) =>
  //           index < 2 ? <Badge key={tag}>{normalizeTag(tag)}</Badge> : null
  //         )}
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "acciones",
    header: () => {
      return <>Acciones</>
    },
    cell: ({ row }) => {
      const canAnalyze =
        row.original?.status !== "analyzed" &&
        row.original?.status !== "analyzing"

      const { toast } = useToast()

      const deleteTaskMutation = useDeleteTaskMutation()

      const handleCopyId = () => {
        handleCopyToClipboard(row.original?.uuid as string)
        toast({ title: "ID copiado al portapapeles" })
      }

      const handleDownloadAudio = async () => {
        const audioURL = row.original?.URL
        if (!audioURL) {
          toast({ title: "No hay audio disponible" })
          return
        }

        // Check if it's a network path
        if (audioURL.startsWith("\\\\") || audioURL.startsWith("file://")) {
          const a = document.createElement("a")
          const gettingAudioToast = toast({
            title: "Obteniendo audio...",
            duration: 3000,
          })
          try {
            const response = await fetch(
              `${await getHost()}/api/audio?path=${audioURL}`
            )
            if (!response.ok) {
              throw new Error("No se pudo obtener el audio")
            }
            const result = await response.blob()
            if (!result.size) {
              gettingAudioToast.dismiss()
              throw new Error("No se pudo obtener el audio")
            }
            const url = window.URL.createObjectURL(result)
            a.href = url
            a.download = `${row.original?.uuid}.mp3`
            a.click()

            // Cleanup
            window.URL.revokeObjectURL(url)
            gettingAudioToast.dismiss()
            toast({ title: "Audio descargado" })
          } catch (error) {
            gettingAudioToast.dismiss()
            toast({
              title: "Error al descargar el audio",
              description:
                error instanceof Error ? error.message : "Error desconocido",
              variant: "destructive",
            })
          } finally {
            gettingAudioToast.dismiss()
            a.remove()
          }
          return
        }
      }

      return (
        <div className='justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='icon' variant={"ghost"}>
                <span className='sr-only'>Acciones</span>
                <Ellipsis size={GLOBAL_ICON_SIZE} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='min-w-60'
              align={"center"}
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation()
              }
            >
              <div className='p-2 flex flex-col gap-2'>
                <h1 className='text-sm font-bold'>Información adicional</h1>
                <section className='flex gap-2 items-center' id='agent-info'>
                  {row.original?.first_name && row.original?.last_name && (
                    <>
                      <User size={GLOBAL_ICON_SIZE} />
                      <span className='text-sm'>
                        {row.original?.first_name} {row.original?.last_name}
                      </span>
                    </>
                  )}
                </section>
              </div>
              <DropdownMenuSeparator />

              {canAnalyze && (
                <DropdownMenuItem className='gap-2'>
                  <Sparkles
                    size={GLOBAL_ICON_SIZE}
                    className='animate-sparkle'
                  />
                  <span>Analizar tarea</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='gap-2' onClick={handleCopyId}>
                <Clipboard size={GLOBAL_ICON_SIZE} />
                <span>Copiar ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='gap-2'
                onClick={handleDownloadAudio}
                disabled={!row.original?.URL}
              >
                <Download size={GLOBAL_ICON_SIZE} />
                <span>Descargar audio</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 text-destructive'
                onClick={() => deleteTaskMutation.mutate(row.original?.uuid)}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? (
                  <Loader2 size={GLOBAL_ICON_SIZE} className='animate-spin' />
                ) : (
                  <Trash size={GLOBAL_ICON_SIZE} />
                )}
                <span>Borrar tarea</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

function UrlBuilder({ uuid, file_name }: { uuid: string; file_name: string }) {
  const taskURL = `/dashboard/transcription?identifier=${uuid}${
    file_name ? `&file_name=${file_name}` : ""
  }`
  return taskURL
}
