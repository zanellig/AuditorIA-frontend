import { ColumnDef } from "@tanstack/react-table"
import { TasksRecordsResponse } from "@/lib/types"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Clipboard,
  Download,
  Ellipsis,
  Loader2,
  Sparkles,
  Trash,
} from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useToast } from "@/components/ui/use-toast"
import { useDeleteTaskMutation } from "@/lib/hooks/mutations/delete-task-mutation"
import { fetchAudioData } from "@/lib/actions"

export const columns: ColumnDef<TasksRecordsResponse>[] = [
  {
    accessorKey: "uuid",
    header: () => {
      return <div className='text-start'>ID</div>
    },
    cell: ({ row }) => {
      const ID = row.original?.uuid as TasksRecordsResponse["uuid"]
      const slicedID = `${ID.slice(0, 6)}...`

      return (
        <div key={`check-${row.original?.uuid}`}>
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
    header: () => {
      return <div>Estado</div>
    },
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          {renderMarker(row.original?.status as Status)}
          <span className='font-bold capitalize'>{row.original?.status}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "user",
    header: () => {
      return <div>Agente</div>
    },
    cell: ({ row }) => {
      if (!row.original?.user) {
        return <div>-</div>
      }
      return <span>{row.original?.user}</span>
    },
  },
  {
    accessorKey: "campaign",
    header: () => {
      return <div>Campaña</div>
    },
    cell: ({ row }) => {
      if (!row.original?.campaign) {
        return <div>-</div>
      }
      return <A>{row.original?.campaign}</A>
    },
  },
  {
    accessorKey: "audio_duration",
    header: () => {
      return <div>Duración</div>
    },
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
    header: () => {
      return <div>Fecha</div>
    },
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
      return <>Audio</>
    },
    cell: ({ row }) => (
      <Badge variant={row.original?.URL ? "success" : "error"}>
        {row.original?.URL ? "Audio disponible" : "Audio no disponible"}
      </Badge>
    ),
  },
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
            const audioBuffer = await fetchAudioData(audioURL)
            if (!audioBuffer) {
              gettingAudioToast.dismiss()
              throw new Error("No se pudo obtener el audio")
            }
            // Create blob from buffer and create download link
            const blob = new Blob([audioBuffer])
            const url = window.URL.createObjectURL(blob)
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
            a.remove()
          }
          return
        }

        // Handle regular HTTP URLs as before
        const a = document.createElement("a")
        a.href = audioURL
        a.download = `${row.original?.uuid}.mp3`
        a.click()
        toast({ title: "Audio descargado" })
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
            <DropdownMenuContent className='min-w-60' align={"center"}>
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
