import { useQuery } from "@tanstack/react-query"

export function useAudit({
  uuid,
  enabled = true,
}: {
  uuid: string
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ["audit", uuid],
    queryFn: () => getAudit(uuid),
    enabled: !!uuid && enabled,
  })
}

async function getAudit(uuid: string) {
  const url = new URL(`http://10.20.62.96:5678/webhook/operator_quality`)
  url.searchParams.set("task_uuid", uuid)
  const data = await fetch(url).then(async res => {
    if (!res.ok) {
      throw new Error("Failed to fetch audit")
    }
    return await res.json()
  })
  return data
}
