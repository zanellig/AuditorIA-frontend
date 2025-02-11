import { ColumnDef } from "@tanstack/react-table"
import { TaskRecordsResponse } from "@/lib/types.d"
import Link from "next/link"
import { formatTimestamp, secondsToHMS } from "@/lib/utils"
import A from "@/components/typography/a"
import { renderMarker } from "@/components/tables/marker-renderer"

import { type Status } from "@/lib/types.d"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<TaskRecordsResponse>[] = [
  {
    accessorKey: "uuid",
    header: () => {
      return <div className='text-start'>ID</div>
    },
    cell: ({ row }) => {
      const ID = row.original?.uuid as TaskRecordsResponse["uuid"]
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
]

function UrlBuilder({ uuid, file_name }: { uuid: string; file_name: string }) {
  const taskURL = `/dashboard/transcription?identifier=${uuid}${
    file_name ? `&file_name=${file_name}` : ""
  }`
  return taskURL
}
