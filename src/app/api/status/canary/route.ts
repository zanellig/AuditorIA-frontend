import { env } from "@/env"
import { ServerStatusBadgeVariant } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const response = await fetch([env.API_CANARY_7000, "docs"].join("/"), {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    if (response.status) {
      switch (Number(response.status)) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json(
      {
        variant: ServerStatusBadgeVariant.Error,
        server: "canary",
        release: "CANARY",
      },
      {
        status: 500,
        statusText:
          "(1017): Error al obtener el estado del servidor de pruebas.",
        headers,
      }
    )
  }
}
