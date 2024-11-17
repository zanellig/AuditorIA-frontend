import { _get } from "@/lib/fetcher"
import { env } from "@/env"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import { isAuthenticated } from "@/lib/auth"

export const revalidate = 5

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const authorized = await isAuthenticated()
  if (!authorized) {
    return NextResponse.json(["Unauthorized", null], {
      status: 401,
      headers: await getHeaders(request),
    })
  }
  const headers = await getHeaders(request)
  if (headers instanceof NextResponse) return headers
  // Fetch data
  const [error, response] = await _get(env.API_MAIN + "/docs", undefined, {
    expectJson: false,
    onlyReturnStatus: true,
    cacheResponse: false,
  })
  // Handle errors
  if (error) {
    return NextResponse.json(
      {
        variant: ServerStatusBadgeVariant.Error,
        text: "(1014): Error al obtener el estado del servidor principal.",
      },
      {
        status: 500,
        statusText:
          "(1014): Error al obtener el estado del servidor principal.",
        headers,
      }
    )
  }

  // Handle response status
  if (response) {
    switch (Number(response)) {
      case 200:
        return NextResponse.json(
          {
            variant: ServerStatusBadgeVariant.OK,
            server: "main",
            release: "STABLE",
          },
          { status: 200, headers }
        )
      case 404:
        return NextResponse.json(
          {
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          },
          {
            status: 404,
            statusText: "(1011): Servidor principal no encontrado.",
            headers,
          }
        )
      case 500:
        return NextResponse.json(
          {
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          },
          {
            status: 500,
            statusText:
              "(1012): Error al obtener el estado del servidor principal.",
            headers,
          }
        )
      default:
        return NextResponse.json(
          {
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          },
          {
            status: 521,
            statusText: "(1013): Servidor principal no disponible.",
            headers,
          }
        )
    }
  }
}
