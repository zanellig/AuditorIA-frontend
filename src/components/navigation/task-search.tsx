"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTasksRecords } from "@/lib/hooks/use-task-records"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { renderMarker } from "../tables/marker-renderer"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import type { Status } from "@/lib/types"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function TaskSearch({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { data, setSearch, isPending, isFetching, resetFilters } =
    useTasksRecords({})

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = (value: string) => {
    if (!value) {
      setSearch(null)
      resetFilters()
    } else {
      setSearch(value)
    }
  }

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          "relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
          className
        )}
        onClick={() => setOpen(true)}
        aria-label='Abrir búsqueda de tareas'
      >
        <Search className='mr-2 h-4 w-4' />
        <span className='hidden lg:inline-flex'>Buscar tareas...</span>
        <span className='inline-flex lg:hidden'>Buscar...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle className='sr-only'>Búsqueda de tareas</DialogTitle>
          <DialogDescription className='sr-only'>
            Busca tareas por UUID, nombre de archivo, campaña u operador
          </DialogDescription>
        </VisuallyHidden>
        <CommandInput
          placeholder='Buscar todas las tareas...'
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandGroup heading='Tareas'>
            {data?.success &&
              data.tasks.map(task => (
                <CommandItem
                  key={task.uuid}
                  value={task.uuid}
                  onSelect={() => {
                    setOpen(false)
                    router.push(
                      `/dashboard/transcription?identifier=${task.uuid}&file_name=${task.file_name}`
                    )
                  }}
                >
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='flex gap-2 justify-between items-center'>
                      <span>{task.uuid}</span>
                      {renderMarker(task.status as Status)}
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      Campaña: {task.campaign} | Operador: {task.user}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      Nombre del archivo: {task.file_name}
                    </span>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandEmpty className='flex justify-center items-center w-full p-8 gap-2'>
            {isPending || isFetching ? (
              <>
                <Loader2
                  size={GLOBAL_ICON_SIZE}
                  className='animate-spin'
                  aria-hidden='true'
                />
                <span className='text-muted-foreground'>
                  Buscando tareas...
                </span>
              </>
            ) : (
              "No se han encontrado tareas."
            )}
          </CommandEmpty>
        </CommandList>
      </CommandDialog>
    </>
  )
}
