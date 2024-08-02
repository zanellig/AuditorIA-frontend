"use client"

import { Table as ReactTableInstance } from "@tanstack/react-table"

import { Input } from "@/components/ui/input"

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
          table.getColumn("identifier")?.setFilterValue(event.target.value)
        }}
        className='max-w-sm h-8'
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
        className='max-w-sm h-8'
      />
    )
  }
}
