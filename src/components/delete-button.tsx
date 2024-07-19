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
  /**
   * TODO: Implement deletion API call
   * https://tasks.office.com/linksolution.com.ar/Home/Task/BYl9VJs82kec_NdGE_7RlWUAJYii?Type=TaskLink&Channel=Link&CreatedTime=638566702346980000
   */
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
              className='font-bold hover:text-destructive hover:outline-1 hover:-outline-offset-1 hover:outline hover:outline-destructive  hover:bg-transparent'
              onClick={() => {
                if (ids) {
                  console.log(ids)
                } else if (identifier) {
                  console.log(identifier)
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
