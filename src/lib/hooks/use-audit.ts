import { useUser } from "@/components/context/UserProvider"
import { useQuery } from "@tanstack/react-query"

export function useAudit({
  uuid,
  enabled = true,
}: {
  uuid: string
  enabled?: boolean
}) {
  const user = useUser()
  return useQuery({
    queryKey: ["audit", uuid, user?.username],
    queryFn: () => getAudit(uuid, user?.username),
    enabled: !!uuid && enabled,
  })
}

async function getAudit(uuid: string, username?: string) {
  const url = new URL(`http://10.20.62.96:5678/webhook/operator_quality`)
  url.searchParams.set("task_uuid", uuid)
  const data = await fetch(url, {
    headers: {
      "x-username": username ?? "",
    },
  }).then(async res => {
    if (!res.ok) {
      const data = await res.json()
      throw new Error(
        data.message || data.error || "Error al obtener el informe"
      )
    }
    return await res.json()
  })
  return data
}
