import { _get } from "@/lib/fetcher"
import { API_MAIN } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"

export const revalidate = 5

export async function GET(request: Request) {
  const headers = getHeaders(API_MAIN)

  // Fetch data
  const [error, response] = await _get(API_MAIN + "/docs", headers, {
    expectJson: false,
  })

  // Handle errors
  if (error) {
    return new Response(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.Error,
        text: "Main server error",
      }),
      { status: 500 }
    )
  }

  // Handle response status
  if (response) {
    switch (response.status) {
      case 200:
        return new Response(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.OK,
            text: "Main server OK",
          }),
          { status: 200 }
        )
      case 404:
        return new Response(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            text: "Main server not found",
          }),
          { status: 404 }
        )
      case 500:
        return new Response(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            text: "Main server error",
          }),
          { status: 500 }
        )
      default:
        return new Response(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Warning,
            text: "Main server warning",
          }),
          { status: 500 }
        )
    }
  }

  // Fallback for when response is null
  return new Response(
    JSON.stringify({
      variant: ServerStatusBadgeVariant.Warning,
      text: "Main server warning",
    }),
    { status: 500 }
  )
}
