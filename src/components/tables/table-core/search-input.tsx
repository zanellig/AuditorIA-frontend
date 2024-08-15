"use client"

import { Table as ReactTableInstance } from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { useEffect } from "react"

interface SearchInputProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
}

export default function SearchInput<TData>({
  table,
  type,
}: SearchInputProps<TData>) {
  if (type === "tasks") {
    return (
      <Input
        placeholder='Filtrar por ID...'
        value={table.getColumn("identifier")?.getFilterValue() as string}
        onChange={event => {
          if (event.target.value.length > 0) {
            table.getColumn("identifier")?.setFilterValue(event.target.value)
          }
          table.getColumn("identifier")?.setFilterValue(event.target.value)
          table.setPageIndex(0)
        }}
        className='max-w-sm bg-input-background focus:bg-background'
      />
    )
  }

  if (type === "records") {
    return (
      <Input
        placeholder='Filtrar por ID de llamado...'
        value={table.getColumn("IDLLAMADA")?.getFilterValue() as string}
        onChange={event => {
          table.getColumn("IDLLAMADA")?.setFilterValue(event.target.value)
        }}
        className='max-w-sm bg-input-background focus:bg-background'
      />
    )
  }
}
