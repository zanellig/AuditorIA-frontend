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
  const headers = await getHeaders(request)
  const authorized = await isAuthenticated()
  if (!authorized) {
    return NextResponse.json(
      {
        variant: ServerStatusBadgeVariant.Error,
        server: "main",
        release: "STABLE",
      },
      {
        status: 401,
        statusText:
          "(1012): Error al obtener el estado del servidor principal.",
        headers,
      }
    )
  }
  if (headers instanceof NextResponse) return headers
  // Fetch data
  const [error, response] = await _get(
    env.API_CANARY_7000 + "/docs",
    undefined,
    {
      expectJson: false,
      onlyReturnStatus: true,
      cacheResponse: false,
    }
  )
  // Handle errors
  if (error) {
    return new NextResponse(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.Error,
        server: "canary",
        release: "CANARY",
      }),
      {
        status: 500,
        statusText:
          "(1015): Error al obtener el estado del servidor de pruebas.",
        headers,
      }
    )
  }

  // Handle response status
  if (response) {
    switch (Number(response)) {
      case 200:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.OK,
            server: "canary",
            release: "CANARY",
          }),
          { status: 200, headers }
        )
      case 404:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "canary",
            release: "CANARY",
          }),
          {
            status: 404,
            statusText: "(1016): Servidor de pruebas no encontrado.",
            headers,
          }
        )
      case 500:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "canary",
            release: "CANARY",
          }),
          {
            status: 500,
            statusText:
              "(1017): Error al obtener el estado del servidor de pruebas.",
            headers,
          }
        )
      default:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "canary",
            release: "CANARY",
          }),
          {
            status: 521,
            statusText: "(1018): Servidor de pruebas no disponible.",
            headers,
          }
        )
    }
  }
}
