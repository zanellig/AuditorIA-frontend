import { _get } from "@/lib/fetcher"
import { API_CANARY } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"

export const revalidate = 5

export async function GET(request: Request) {
  const headers = getHeaders(API_CANARY)

  // Fetch data
  const [error, response] = await _get(API_CANARY + "/docs", headers, {
    expectJson: false,
  })

  // Handle errors
  if (error) {
    return new Response(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.Error,
        text: "Canary server error",
      }),
      { status: 500 }
    )
  }

  // Handle response status
  if (response && response.ok) {
    return new Response(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.OK,
        text: "Canary server OK",
      }),
      { status: 200 }
    )
  }

  // Default case
  return new Response(
    JSON.stringify({
      variant: ServerStatusBadgeVariant.Warning,
      text: "Canary server warning",
    }),
    { status: response?.status || 500 }
  )
}
