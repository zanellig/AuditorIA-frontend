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
import { _transcriptPath, _urlBase } from "@/lib/api/paths"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function DeleteButton({
  identifier,
  ids,
  className,
}: {
  identifier?: Task["identifier"]
  ids?: Task["identifier"][]
  className?: string
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
              onClick={() => {
                if (ids) {
                  console.info(ids)
                  deleteTasks(_urlBase, _transcriptPath, ids, true)
                } else if (identifier) {
                  console.info(identifier)
                  deleteTask(_urlBase, _transcriptPath, identifier, true)
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
