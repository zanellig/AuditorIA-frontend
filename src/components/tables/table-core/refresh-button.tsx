"use client"
import { Button } from "@/components/ui/button"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { cn } from "@/lib/utils"
import {
  useMutation,
  type QueryKey,
  useQueryClient,
} from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

interface RefreshButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  queryKey?: QueryKey
}

export default function RefreshButton({ queryKey }: RefreshButtonProps) {
  if (!queryKey) return null
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: async () => {
      console.log(`Starting fetch for query ${queryKey}`)
      console.time(queryKey.toString())
      queryClient.cancelQueries({ queryKey })
      await queryClient.refetchQueries({ queryKey })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      console.log(`Refetched query ${queryKey}`)
      console.timeEnd(queryKey.toString())
    },
  })
  return (
    <Button
      size='icon'
      variant={"ghost"}
      onClick={() => {
        mutation.mutate()
      }}
      className='transition-transform duration-300'
      disabled={mutation.isPending}
    >
      <RefreshCw
        size={GLOBAL_ICON_SIZE}
        className={cn(mutation.isPending && "animate-spin")}
      />
    </Button>
  )
}
