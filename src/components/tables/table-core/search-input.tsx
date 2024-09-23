"use client"

import { Table as ReactTableInstance } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface SearchInputProps<TData> {
  table: ReactTableInstance<TData>
}

export default function SearchInput<TData>({ table }: SearchInputProps<TData>) {
  const [searchValue, setSearchValue] = useState<string>("")

  useEffect(() => {
    // Set the filter value for all columns when search value changes
    table.setGlobalFilter(searchValue)
    // Reset to the first page when search input changes
    if (searchValue.length > 0) {
      table.setPageIndex(0)
    }
  }, [searchValue, table])

  return (
    <Input
      placeholder='Buscar fila...'
      value={searchValue}
      onChange={event => setSearchValue(event.target.value)}
      className='max-w-sm bg-input-background focus:bg-background'
    />
  )
}
