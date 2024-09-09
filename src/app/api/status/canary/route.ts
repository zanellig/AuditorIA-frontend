import { _get } from "@/lib/fetcher"
import { API_CANARY } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"

export const revalidate = 5

export async function GET() {
  const headers = getHeaders(API_CANARY)

  // Fetch data
  const [error, response] = await _get(API_CANARY + "/docs", headers, {
    expectJson: false,
    onlyReturnStatus: true,
    cacheResponse: true,
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
  if (response) {
    switch (Number(response)) {
      case 200:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.OK,
            text: "Canary server OK",
          }),
          { status: 200 }
        )
      case 404:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            text: "Canary server not found",
          }),
          { status: 404 }
        )
      case 500:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            text: "Canary server error",
          }),
          { status: 500 }
        )
      default:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            text: "Canary server unavailable",
          }),
          { status: 521 }
        )
    }
  }
}
