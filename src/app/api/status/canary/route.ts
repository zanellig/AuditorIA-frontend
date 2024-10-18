import { _get } from "@/lib/fetcher"
import { env } from "@/env"
import { getHeaders } from "@/lib/utils"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextResponse } from "next/server"

export const revalidate = 5

export async function GET() {
  const headers = getHeaders(env.API_CANARY)

  // Fetch data
  const [error, response] = await _get(env.API_CANARY + "/docs", headers, {
    expectJson: false,
    onlyReturnStatus: true,
    cacheResponse: false,
  })
  console.log("response:", response)
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
          { status: 200 }
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
          }
        )
    }
  }
}
