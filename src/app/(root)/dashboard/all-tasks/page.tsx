/* eslint-disable @typescript-eslint/no-unused-vars -- Disabled while testing */
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookAudio,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader,
  RefreshCw,
} from "lucide-react"
import ServerDataTable from "@/components/tables/table-core/server-data-table"
import TableContainer from "@/components/tables/table-core/table-container"
import { columns } from "@/components/tables/troublesome-tasks/columns-troublesome-tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TitleContainer from "@/components/title-container"
import { TypographyH4 } from "@/components/typography/h4"
import { TaskRecordsSearchParams } from "@/lib/types"
import { useTasksRecords } from "@/lib/hooks/use-task-records"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export default function TroublesomeTasksPage() {
  const {
    data,
    page,
    isPending,
    error,
    isFetching,
    selectedFilter,
    search,
    refetch,
    setSearch,
    setSelectedFilter,
    resetFilters,
    setNextPage,
    setPreviousPage,
    setLastPage,
    setFirstPage,
  } = useTasksRecords({})

  return (
    <TableContainer className='gap-2'>
      <TitleContainer separate className='gap-2'>
        <BookAudio className={DASHBOARD_ICON_CLASSES} />
        <TypographyH4>Todas las tareas</TypographyH4>
      </TitleContainer>
      {(typeof data?.message === "string" || error !== null) && (
        <Accordion type='single' collapsible>
          <AccordionItem value='1'>
            <AccordionTrigger className='text-error'>
              Ocurrió un error
            </AccordionTrigger>
            <AccordionContent className='flex flex-col gap-2'>
              <p>{data?.message || error?.message}</p>
              <Button
                variant='secondary'
                onClick={() => {
                  refetch()
                }}
              >
                Reintentar
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <section className='flex justify-start items-center gap-2'>
        <div className='flex flex-row justify-start items-center gap-2'>
          <Button
            size={"icon"}
            variant={"outline"}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={GLOBAL_ICON_SIZE}
              className={cn(isFetching && "animate-spin")}
            />
          </Button>
        </div>
        <Input
          placeholder='Buscar tarea...'
          onChange={e => setSearch(e.target.value)}
          value={search || ""}
          className='bg-popover'
          disabled={isFetching || isPending}
        />
        <Select
          onValueChange={(value: keyof TaskRecordsSearchParams) => {
            setSelectedFilter(value)
          }}
          value={selectedFilter || "globalSearch"}
          disabled={isFetching || isPending}
        >
          <SelectTrigger className='bg-popover'>
            <SelectValue placeholder='Seleccionar filtro...' />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value='globalSearch' className='text-muted-foreground'>
              Seleccionar filtro...
            </SelectItem>
            <SelectItem value='uuid'>ID</SelectItem>
            <SelectItem value='file_name'>Nombre de archivo</SelectItem>
            <SelectItem value='status'>Estado</SelectItem>
            <SelectItem value='user'>Agente</SelectItem>
            <SelectItem value='campaign'>Campaña</SelectItem>
          </SelectContent>
        </Select>
        <div className='flex flex-row justify-start items-center gap-2'>
          <Button
            onClick={resetFilters}
            variant={"outline"}
            disabled={isFetching || isPending}
          >
            Borrar filtros
          </Button>
          <Button
            onClick={setFirstPage}
            variant={"outline"}
            size='icon'
            disabled={page === 0 || isFetching || isPending}
          >
            <ChevronsLeftIcon size={GLOBAL_ICON_SIZE} />
          </Button>
          <Button
            onClick={setPreviousPage}
            variant={"outline"}
            size='icon'
            disabled={page === 0 || isFetching || isPending}
          >
            <ChevronLeftIcon size={GLOBAL_ICON_SIZE} />
          </Button>
          <Button
            onClick={setNextPage}
            variant={"outline"}
            size='icon'
            disabled={!data?.hasMore || isFetching || isPending}
          >
            <ChevronRightIcon size={GLOBAL_ICON_SIZE} />
          </Button>
          <Button
            onClick={setLastPage}
            variant={"outline"}
            size='icon'
            disabled={!data?.hasMore || isFetching || isPending}
          >
            <ChevronsRightIcon size={GLOBAL_ICON_SIZE} />
          </Button>
        </div>
      </section>
      <motion.div
        layout
        className='relative w-full min-h-32 flex flex-col gap-2'
      >
        <AnimatePresence mode='popLayout'>
          {(isPending || isFetching) && (
            <motion.div
              key='loader'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0 flex justify-center items-center rounded-md bg-background/80 backdrop-blur-sm z-10'
            >
              <Loader className='animate-spin' />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          transition={{
            layout: { duration: 0.3, ease: "easeInOut" },
          }}
        >
          {data && (
            <ServerDataTable
              columns={columns}
              data={data?.tasks ? data.tasks : []}
            />
          )}
          {error && (
            <motion.div
              key='error'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='text-destructive'
            >
              {error?.message}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      <section className='flex justify-between items-center gap-2'>
        <span className='text-muted-foreground'>
          Página {data?.total ? page : 0} de {data?.total ? data.pages : 0}
        </span>
      </section>
    </TableContainer>
  )
}
