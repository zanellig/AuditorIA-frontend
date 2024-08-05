"use client"

import * as React from "react"

import { Table as ReactTableInstance } from "@tanstack/react-table"

import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CirclePlus } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Recording, Task, Status } from "@/lib/types"

interface SeleccionadorProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
}

export default function SeleccionadorEstadoUsuario<TData>({
  table,
  type,
}: SeleccionadorProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedStatus, setSelectedValue] = React.useState<
    Task["status"] | Recording["USUARIO"] | null
  >(null)

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='w-fit justify-start border-dashed space-x-2 text-sm mr-auto ml-0'
          >
            <CirclePlus size={GLOBAL_ICON_SIZE} />
            <span>
              {selectedStatus ? (
                <>{selectedStatus.toString()}</>
              ) : (
                <>{type === "tasks" ? "Estado" : "Usuario"}</>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0' align='start'>
          <StatusList
            setOpen={setOpen}
            setSelectedValue={setSelectedValue}
            table={table}
            type={type}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant='outline'
          className='w-[150px] border-dashed justify-start space-x-2 text-sm'
        >
          <CirclePlus size={GLOBAL_ICON_SIZE} />
          <span>
            {selectedStatus ? (
              <>{selectedStatus.toString()}</>
            ) : (
              <>{type === "tasks" ? "Estado" : "Usuario"}</>
            )}
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className='mt-4 border-t'>
          <StatusList
            setOpen={setOpen}
            setSelectedValue={setSelectedValue}
            table={table}
            type={type}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList<TData>({
  setOpen,
  setSelectedValue,
  table,
  type,
}: {
  setOpen: (open: boolean) => void
  setSelectedValue: (value: Task["status"] | Recording["USUARIO"]) => void
  table: ReactTableInstance<TData>
  type?: string
}) {
  const rowModel = table.getRowModel()
  const rows = rowModel.rows
  const operadores = new Set<number | Status>()

  for (const row of rows) {
    if (type === "records") {
      operadores.add(row.getValue("USUARIO") as number)
    } else if (type === "tasks") {
      operadores.add(row.getValue("status") as Status)
    }
  }

  return (
    <Command>
      <CommandInput placeholder='Filtrar' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Array.from(operadores).map(operador => (
            <CommandItem
              key={operador.toString()}
              value={operador.toString()}
              onSelect={value => {
                const selected = Array.from(operadores).find(
                  op => op.toString() === value
                )
                if (selected !== undefined) {
                  setSelectedValue(selected)
                }
                setOpen(false)
              }}
            >
              {operador.toString()}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
