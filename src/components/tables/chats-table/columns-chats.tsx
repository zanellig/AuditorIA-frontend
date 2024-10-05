"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { getLocaleMonth } from "@/lib/utils"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: () => {
      return <div>Mes</div>
    },
    cell: ({ row }) => {
      return <div>{getLocaleMonth(row.original?.id as number)}</div>
    },
  },
]
