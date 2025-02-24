import { env } from "@/env"
import { ServerStatusBadgeVariant } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"

export const revalidate = 5

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const response = await fetch([env.API_MAIN, "docs"].join("/"), {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    if (response.status) {
      switch (Number(response.status)) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
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
  }
}
