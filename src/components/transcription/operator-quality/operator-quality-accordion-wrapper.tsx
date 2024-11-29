import * as React from "react"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { DASHBOARD_ICON_CLASSES, GLOBAL_ICON_SIZE } from "@/lib/consts"
import { Loader, Sparkles } from "lucide-react"
import { Task } from "@/lib/types"
import { getHost } from "@/lib/actions"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { PerformanceDashboard } from "./performance-dashboard"

export default function OperatorQualityAccordionWrapper({
  id,
  className,
}: {
  id: Task["identifier"]
  className?: string
}) {
  const [ableToFetch, setAbleToFetch] = React.useState(false)
  const query = useQuery({
    queryKey: ["operator-quality", id],
    queryFn: async () => {
      return await fetch(
        `${await getHost()}/api/task/operator_quality?identifier=${id}`
      ).then(async res => {
        if (!res.ok)
          throw new Error(
            "Error al obtener la auditoría de calidad del operador"
          )
        return await res.json()
      })
    },
    enabled: (id && ableToFetch) || false,
  })
  return (
    <AccordionItem value='3'>
      <AccordionTrigger onClick={() => setAbleToFetch(true)}>
        <span className='flex gap-2 justify-start items-center'>
          <span>Obtener auditoría</span>
          <Sparkles size={GLOBAL_ICON_SIZE} className='animate-sparkle' />
        </span>
      </AccordionTrigger>
      <AccordionContent className={cn(className, "min-w-[800px]")}>
        {query.isLoading && (
          <div className='flex justify-center w-full'>
            <Loader className={cn(DASHBOARD_ICON_CLASSES, "animate-spin")} />
          </div>
        )}
        {query.error && (
          <code className='text-error'>{(query.error as Error).message}</code>
        )}
        {query.data && <PerformanceDashboard initialData={query.data} />}
      </AccordionContent>
    </AccordionItem>
  )
}
