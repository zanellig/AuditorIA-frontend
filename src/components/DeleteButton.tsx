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
  /**
   * TODO: Implement deletion API call
   * https://tasks.office.com/linksolution.com.ar/Home/Task/BYl9VJs82kec_NdGE_7RlWUAJYii?Type=TaskLink&Channel=Link&CreatedTime=638566702346980000
   */
  return (
    <div onClick={e => e.stopPropagation()} className='w-full h-full'>
      <AlertDialog>
        <AlertDialogTrigger className='w-full h-full text-start cursor-default'>
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
              borrará{" "}
              <span className='font-bold text-primary'>permanentemente</span> la
              transcripción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className='font-bold hover:text-destructive hover:outline-1 hover:-outline-offset-1 hover:outline hover:outline-destructive  hover:bg-transparent'
              onClick={() => {
                console.log(id)
              }}
            >
              Eliminar transcripción para siempre
            </AlertDialogAction>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
