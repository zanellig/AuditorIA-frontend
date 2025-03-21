import { useQuery } from "@tanstack/react-query"

type AgentResponse = {
  name: string
  surname: string
  email: string
}

export const useAgent = (agentId: number) => {
  return useQuery<AgentResponse>({
    queryKey: ["agent", agentId],
    queryFn: () => getAgent(agentId),
    enabled: !!agentId,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  })
}

const getAgent = async (agentId: number) => {
  const url = new URL("http://10.20.62.96:5678/webhook/neo_username")
  url.searchParams.set("id", agentId.toString())
  const response = await fetch(url)
  const data = await response.json()
  return data
}
