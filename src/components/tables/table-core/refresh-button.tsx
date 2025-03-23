"use client"
import { Button } from "@/components/ui/button"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { cn } from "@/lib/utils"
import {
  useMutation,
  type QueryKey,
  useQueryClient,
  MutationStatus,
  FetchStatus,
  QueryStatus,
} from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

interface RefreshButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  queryKey?: QueryKey
  status: QueryStatus | FetchStatus | MutationStatus
}

export default function RefreshButton({
  queryKey,
  status,
}: RefreshButtonProps) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: queryKey,
    mutationFn: async () => {
      console.log(`Starting fetch for query ${queryKey}`)
      console.time(queryKey?.toString() || "refresh")
      if (queryKey) {
        queryClient.cancelQueries({ queryKey })
        await queryClient.refetchQueries({ queryKey })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      console.log(`Refetched query ${queryKey}`)
      console.timeEnd(queryKey?.toString() || "refresh")
    },
  })

  if (!queryKey) return null

  const isLoading =
    mutation.isPending || status === "pending" || status === "fetching"
  return (
    <Button
      size='icon'
      variant={"ghost"}
      onClick={() => {
        mutation.mutate()
      }}
      className='transition-transform duration-300'
      disabled={isLoading}
    >
      <RefreshCw
        size={GLOBAL_ICON_SIZE}
        className={cn(isLoading && "animate-spin")}
      />
    </Button>
  )
}
