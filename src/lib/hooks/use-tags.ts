import { useQuery } from "@tanstack/react-query"

type TagsResponse = {
  tags: string[]
  extraTags: string[]
}

export const useTags = (uuid: string) => {
  return useQuery<TagsResponse>({
    queryKey: ["tags", uuid],
    queryFn: () => getTags(uuid),
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  })
}

async function getTags(uuid: string) {
  const url = new URL("http://10.20.62.96:5678/webhook/generate_tags")
  url.searchParams.set("uuid", uuid)
  const response = await fetch(url)
  return response.json()
}
