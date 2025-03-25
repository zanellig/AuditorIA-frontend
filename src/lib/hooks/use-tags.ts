import { useQuery } from "@tanstack/react-query"

interface TagsResponse {
  tags: string[]
  extraTags: string[]
}

export const useTags = ({
  uuid,
  generateNewTags = false,
}: {
  uuid: string
  generateNewTags?: boolean
}) => {
  return useQuery<TagsResponse>({
    queryKey: ["tags", uuid, { generateNewTags }],
    queryFn: () => getTags(uuid, generateNewTags),
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  })
}

async function getTags(uuid: string, generateNewTags = false) {
  const url = new URL("http://10.20.62.96:5678/webhook/generate_tags")
  url.searchParams.set("uuid", uuid)
  url.searchParams.set("generate_new_tags", generateNewTags.toString())
  const response = await fetch(url)
  return response.json() as Promise<TagsResponse>
}
