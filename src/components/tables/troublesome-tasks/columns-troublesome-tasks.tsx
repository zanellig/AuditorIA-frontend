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
import { Clipboard, Ellipsis, Loader2, Sparkles, Trash } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { getHost } from "@/lib/actions"

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
      return <></>
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
      return <></>
    },
    cell: ({ row }) => {
      const canAnalyze =
        row.original?.status !== "analyzed" &&
        row.original?.status !== "analyzing"

      const { toast } = useToast()

      const deleteTaskMutation = useMutation({
        mutationFn: async () => {
          const url = new URL(`${await getHost()}/api/task`)
          url.searchParams.append("identifier", row.original?.uuid as string)
          const res = await fetch(url.toString(), {
            method: "DELETE",
          })
          if (!res.ok) {
            throw new Error("Error al borrar la tarea")
          }
          return res.json()
        },
        onSuccess: () => {
          toast({ title: "Tarea borrada", variant: "success" })
        },
        onError: () => {
          toast({ title: "Error al borrar la tarea", variant: "destructive" })
        },
      })

      const handleCopyId = () => {
        handleCopyToClipboard(row.original?.uuid as string)
        toast({ title: "ID copiado al portapapeles" })
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 text-destructive'
                onClick={() => deleteTaskMutation.mutate()}
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
