import { ALL_RECORDS_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { RecordingsAPIResponse } from "@/lib/types"
import { getHeaders } from "@/lib/get-headers"
import { isAuthenticated } from "@/lib/auth"

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
    return NextResponse.json(["Unauthorized", null], {
      status: 401,
      headers,
    })
  }
  if (headers instanceof NextResponse) return headers
  try {
    const params = request.nextUrl.searchParams
    const externalUrl = new URL(
      [env.API_CANARY_7000, ALL_RECORDS_PATH].join("/")
    )
    params.forEach((value, key) => {
      externalUrl.searchParams.set(key, value)
    })
    console.log(`Searching records: ${externalUrl}`)
    // TODO: Implement a tag for the request, so that we easily identify what recordings are being cached. Also revalidation can be easier. READ THE DOCS
    const [err, res] = await _get<RecordingsAPIResponse>(
      externalUrl.toString(),
      undefined,
      {
        expectJson: true,
        cacheResponse: true,
      }
    )
    if (err !== null) {
      // @ts-expect-error
      if (err?.detail) {
        if (
          // @ts-ignore
          err.detail ===
          "Error al obtener los registros: 404: No se encontraron registros"
        ) {
          return NextResponse.json([null, []], {
            status: 200,
            headers,
          })
        }
        // @ts-expect-error
        // API hasn't changed yet to return a normalized response, we have to access the detail key if it returns an error
        return NextResponse.json([err.detail, []], {
          status: 500,
          headers,
        })
      }
      return NextResponse.json([err, []], {
        status: 500,
        headers,
      })
    }
    // API never falls back to this clause because when it returns a good response but with no content, it treats it as an error
    if (res === null) {
      return NextResponse.json([null, []], {
        status: 200,
        headers,
      })
    }
    if ("records" in res) {
      return NextResponse.json([null, res.records], {
        status: 200,
        headers,
      })
    }
    return NextResponse.json([null, res], {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json([error, []], {
      status: 500,
      headers,
    })
  }
}
