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

export default function DeleteButton({ id }: { id: string }) {
  return (
    <div onClick={e => e.stopPropagation()} className=''>
      <AlertDialog>
        <AlertDialogTrigger>
          <span className='text-destructive'>Eliminar</span>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Estás seguro que querés borrar la transcripción?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción{" "}
              <span className='font-bold'>no se puede revertir</span>. Esto
              borrará <span className='font-bold'>permanentemente</span> la
              transcripción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className='font-bold'
              onClick={() => {
                console.log(id)
              }}
            >
              Eliminar transcripción para siempre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
