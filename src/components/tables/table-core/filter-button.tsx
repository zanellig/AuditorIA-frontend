import React from "react"
import { Column, Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { CirclePlus, X } from "lucide-react"
import { GLOBAL_ICON_SIZE, IPAD_SIZE_QUERY } from "@/lib/consts"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { DialogTitle } from "@/components/ui/dialog"

interface FilterButtonProps<TData> {
  table: Table<TData>
  column: Column<TData>
  filterValues: Set<string>
}

export default function FilterButton<TData>({
  table,
  column,
  filterValues,
}: FilterButtonProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery(IPAD_SIZE_QUERY)

  const filterValue = column.getFilterValue() as string

  const onSelect = (value: string | null) => {
    if (value === null) {
      column.setFilterValue(null)
      table.firstPage()
    } else {
      column.setFilterValue(value)
      table.firstPage()
    }
    setOpen(false)
  }

  return (
    <div className='flex flex-row space-x-2'>
      {isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='h-8 w-fit justify-start border-dashed space-x-2 text-sm mr-auto ml-0'
            >
              <CirclePlus size={GLOBAL_ICON_SIZE} />
              {filterValue && <span>{filterValue}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[200px] p-0' align='start'>
            <CommandDialog open={open} onOpenChange={setOpen}>
              {/* For accessibility */}
              <DialogTitle className='sr-only'>
                Filter the table by {column.id}. Filtrar la tabla por{" "}
                {column.id}
              </DialogTitle>
              <CommandInput placeholder={`Filtrar por ${column.id}...`} />
              <CommandList>
                {Array.from(filterValues).map(value => (
                  <CommandItem key={value} onSelect={() => onSelect(value)}>
                    {value}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandDialog>
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant='outline'
              className='h-8 w-fit justify-start border-dashed space-x-2 text-sm mr-auto ml-0'
            >
              <CirclePlus size={GLOBAL_ICON_SIZE} />
              {filterValue && <span>{filterValue}</span>}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <Command>
              <CommandInput placeholder={`Filtrar por ${column.id}...`} />
              <CommandList>
                {Array.from(filterValues).map(value => (
                  <CommandItem key={value} onSelect={() => onSelect(value)}>
                    {value}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>
      )}
      {filterValue && (
        <Button
          variant='ghost'
          className='h-8 w-fit justify-start border-dashed space-x-2 text-sm mr-auto ml-0 p-0 px-2 hover:text-foreground text-muted-foreground'
          onClick={() => onSelect(null)}
        >
          <X size={GLOBAL_ICON_SIZE} />
        </Button>
      )}
    </div>
  )
}
