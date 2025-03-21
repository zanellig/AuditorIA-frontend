import { useQuery } from "@tanstack/react-query"

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaign(id),
    enabled: !!id,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  })
}

async function getCampaign(id: number) {
  const url = new URL("http://10.20.62.96:5678/webhook/campaign")
  url.searchParams.set("id", id.toString())
  const response = await fetch(url)
  return response.json()
}
