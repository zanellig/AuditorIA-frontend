"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTask, deleteTasks } from "@/lib/actions"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Table } from "@tanstack/react-table"

export default function DeleteButton<TData>({
  identifier,
  ids,
  table,
  className,
}: {
  identifier?: Task["identifier"]
  ids?: Task["identifier"][]
  className?: string
  table: Table<TData>
}) {
  return (
    <div
      className='w-full h-full'
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div
            className={cn(
              "w-full h-full text-start cursor-default text-destructive ",
              className
            )}
            // the click event is dispatched here
            id={`delete-button-${identifier}`}
          >
            Eliminar
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {ids
                ? "Estás a punto de realizar una eliminación masiva"
                : "¿Estás seguro que querés borrar la transcripción?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción{" "}
              <span className='font-bold'>no se puede revertir</span>. Esto
              borrará{" "}
              <span className='font-bold text-primary'>permanentemente</span>{" "}
              {ids ? "las transcripciones seleccionadas" : "la transcripción"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className='font-bold bg-destructive text-primary hover:text-destructive hover:outline-1 hover:-outline-offset-1 hover:outline hover:outline-destructive  hover:bg-transparent'
              onClick={async () => {
                if (ids) {
                  table.resetRowSelection()
                  const responses = await deleteTasks([...ids], true)
                } else if (identifier) {
                  await deleteTask(identifier, true)
                }
                // this is made to avoid empty pages
                if (
                  table.getPaginationRowModel().rows.length === 1 ||
                  table.getPaginationRowModel().rows.length === ids?.length
                ) {
                  table.setPagination({
                    pageIndex: table.getState().pagination.pageIndex - 1,
                    pageSize: table.getState().pagination.pageSize,
                  })
                }
              }}
            >
              Eliminar {ids ? "transcripciones" : "transcripción"} para siempre
            </AlertDialogAction>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
