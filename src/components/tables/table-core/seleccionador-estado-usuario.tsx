"use client"

/**
 * Esto más que un "seleccionador" es un botón de filtro.
 * Se debería implementar x tabla y no hacer uno general que tome parámetros,
 * hacer un "Filter factory" y pasarle parámetros para agregar todos los que queramos.
 */

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
  CommandSeparator,
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
import { cn } from "@/lib/utils"

interface SeleccionadorProps<TData> {
  table: ReactTableInstance<TData>
  type?: string
  className?: string
  operadores: Array<number | Status>
}

export default function SeleccionadorEstadoUsuario<TData>({
  table,
  type,
  className,
  operadores,
}: SeleccionadorProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedValue, setSelectedValue] = React.useState<
    Task["status"] | Recording["USUARIO"] | null
  >(null)

  const getTypeString = (type: string) => {
    switch (type) {
      case "tasks":
        return "Estado"
      case "records":
        return "Usuario"
    }
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              "h-8 w-fit justify-start border-dashed space-x-2 text-sm mr-auto ml-0",
              className
            )}
          >
            <CirclePlus size={GLOBAL_ICON_SIZE} />
            <span>
              {selectedValue ? (
                <>{selectedValue.toString()}</>
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
            type={type === "tasks" ? "estado" : "usuario"}
            operadores={operadores}
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
            {selectedValue ? (
              <>{selectedValue.toString()}</>
            ) : (
              <span className='capitalize'>{type}</span>
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
            type={type === "tasks" ? "estado" : "usuario"}
            operadores={operadores}
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
  operadores,
}: {
  setOpen: (open: boolean) => void
  setSelectedValue: (value: Task["status"] | Recording["USUARIO"]) => void
  table: ReactTableInstance<TData>
  type?: string
  operadores: Set<number | Status>
}) {
  return (
    <Command>
      <CommandInput placeholder={"Filtrar por " + type} />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup>
          {Array.from(operadores).map(operador => (
            <>
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
            </>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
