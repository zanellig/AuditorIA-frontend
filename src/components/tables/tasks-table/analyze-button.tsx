import ButtonBorderMagic from "@/components/ui/button-border-magic"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { actionRevalidatePath, getHost } from "@/lib/actions"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Task } from "@/lib/types"
import { _URLBuilder } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { Row, Table } from "@tanstack/react-table"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AnalyzeButton({
  row,
  table,
}: {
  row: Row<Task>
  table: Table<Task>
}) {
  const task = row.original
  const { toast } = useToast()
  const currentUrl = usePathname()
  const taskURL = _URLBuilder(task as Task)
  const mutation = useMutation({
    mutationKey: ["task-analysis", row.original?.identifier],
    mutationFn: async () => {
      const url = new URL(`${await getHost()}/api/task`)
      url.searchParams.append("language", `${row.original?.language}`)
      url.searchParams.append("identifier", `${row.original?.identifier}`)
      return await fetch(url, { method: "PUT" }).then(async res => {
        if (!res.ok) throw new Error(res.statusText)
        return (await res.json())[1]
      })
    },
  })
  return (
    <ButtonBorderMagic
      className='w-full h-full text-start'
      id={row.original?.identifier}
      onClick={async () => {
        mutation.mutate()
        toast({
          description: (
            <div className='flex items-center gap-2'>
              <span>Analizando tarea</span>
              <Sparkles className='animate-sparkles' size={GLOBAL_ICON_SIZE} />
            </div>
          ),
        })
        if (mutation.isPending)
          toast({
            title: "Analizando tarea",
            description: "La tarea se está analizando",
            variant: "default",
          })

        if (mutation.isError && !mutation.isPending) {
          toast({
            title: "La tarea no pudo ser analizada",
            description: "Por favor intente más tarde",
            variant: "destructive",
          })
          toast({
            title: "Error",
            description: mutation.error.message,
          })
        }

        if (mutation.data && !mutation.isPending && !mutation.isError)
          toast({
            title: "Tarea analizada",
            description: `Ya puede visualizar el análisis de la tarea ${row.original?.identifier}`,
            variant: "success",
            action: (
              <ToastAction altText='Ir a la transcripción'>
                <Link href={taskURL} className='w-full h-full cursor-default'>
                  Ir a la transcripción
                </Link>
              </ToastAction>
            ),
          })
        actionRevalidatePath(currentUrl)
      }}
    >
      Analizar
    </ButtonBorderMagic>
  )
}
