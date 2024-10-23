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
import { useToast } from "@/components/ui/use-toast"
import { getHost } from "@/lib/actions"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
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
  const { toast } = useToast()
  const mutation = useMutation({
    mutationKey: ["delete-task", identifier],
    mutationFn: async () => {
      if (ids) {
        await fetch(`${await getHost()}/api/tasks`, {
          method: "DELETE",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(ids),
        })
          .then(async res => {
            if (!res.ok) throw new Error(res.statusText)
            return await res.json()
          })
          .catch(e => {
            console.error(e)
            throw new Error("Error de red")
          })
          .finally(() => table.resetRowSelection())
      }
      if (identifier) {
        await fetch(`${await getHost()}/api/task/${identifier}`, {
          method: "DELETE",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        })
          .then(async res => {
            if (!res.ok) throw new Error(res.statusText)
            return await res.json()
          })
          .catch(e => {
            console.error(e)
            throw new Error("Error de red")
          })
      }
    },
  })
  const handleDelete = async () => {
    await mutation.mutateAsync()
    if (mutation.isSuccess) {
      toast({
        description: `${ids ? "Las tareas se han" : "La tarea se ha"} eliminado correctamente`,
        variant: "success",
      })
    }
    if (mutation.isError) {
      toast({
        description: `Error al eliminar ${ids ? "las tareas" : "la tarea"}`,
        variant: "destructive",
      })
    }
    if (mutation.isPending) {
      toast({
        description: `Eliminando ${ids ? "las tareas" : "la tarea"}`,
        variant: "default",
      })
    }
    if (
      table.getPaginationRowModel().rows.length === 1 ||
      table.getPaginationRowModel().rows.length === ids?.length
    ) {
      table.setPagination({
        pageIndex: table.getState().pagination.pageIndex - 1,
        pageSize: table.getState().pagination.pageSize,
      })
    }
  }
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
              <span className='font-bold'>no se puede revertir</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className='font-bold bg-destructive text-primary hover:text-destructive hover:outline-1 hover:-outline-offset-1 hover:outline hover:outline-destructive hover:bg-transparent transition-colors duration-200 ease-in-out'
              onClick={handleDelete}
            >
              Eliminar {ids ? "transcripciones" : "transcripción"}
            </AlertDialogAction>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
