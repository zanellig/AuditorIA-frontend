import { _get } from "@/lib/fetcher"
import { API_CANARY } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"

export const revalidate = 5

export async function GET(request: NextRequest) {
  const headers = getHeaders(API_CANARY)

  // Fetch data
  const [error, response] = await _get(API_CANARY + "/docs", headers, {
    expectJson: false,
  })

  // Handle errors
  if (error) {
    return new NextResponse(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.Error,
        text: "Canary server error",
      }),
      { status: 500 }
    )
  }

  // Handle response status
  if (response && response.ok) {
    return new NextResponse(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.OK,
        text: "Canary server OK",
      }),
      { status: 200 }
    )
  }

  // Default case
  return new NextResponse(
    JSON.stringify({
      variant: ServerStatusBadgeVariant.Warning,
      text: "Canary server warning",
    }),
    { status: response?.status || 500 }
  )
}
