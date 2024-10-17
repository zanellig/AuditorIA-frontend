import { _get } from "@/lib/fetcher"
import { env } from "@/env"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextResponse } from "next/server"

export const revalidate = 5

export async function GET() {
  const headers = getHeaders(env.API_MAIN)

  // Fetch data
  const [error, response] = await _get(env.API_MAIN + "/docs", headers, {
    expectJson: false,
    onlyReturnStatus: true,
    cacheResponse: true,
  })
  // Handle errors
  if (error) {
    return new NextResponse(
      JSON.stringify({
        variant: ServerStatusBadgeVariant.Error,
        text: "(1014): Error al obtener el estado del servidor principal.",
      }),
      {
        status: 500,
        statusText:
          "(1014): Error al obtener el estado del servidor principal.",
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
            server: "main",
            release: "STABLE",
          }),
          { status: 200 }
        )
      case 404:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          }),
          {
            status: 404,
            statusText: "(1011): Servidor principal no encontrado.",
          }
        )
      case 500:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          }),
          {
            status: 500,

            statusText:
              "(1012): Error al obtener el estado del servidor principal.",
          }
        )
      default:
        return new NextResponse(
          JSON.stringify({
            variant: ServerStatusBadgeVariant.Error,
            server: "main",
            release: "STABLE",
          }),
          {
            status: 521,
            statusText: "(1013): Servidor principal no disponible.",
          }
        )
    }
  }
}
