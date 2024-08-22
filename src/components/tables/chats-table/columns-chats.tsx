"use client"
import type { ColumnDef, Row } from "@tanstack/react-table"
import type { Recording } from "@/lib/types"

import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"

import { obtenerMesLocale } from "@/lib/utils"
import { API_MAIN, API_CANARY } from "@/lib/consts"

import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: () => {
      return <div>Mes</div>
    },
    cell: ({ row }) => {
      return <div>{obtenerMesLocale(row.original?.id as number)}</div>
    },
  },
]
