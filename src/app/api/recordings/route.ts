import { ALL_RECORDS_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import { getHeaders } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"
export async function GET(request: NextRequest) {
  try {
    const headers = getHeaders(env.API_CANARY)
    const params = request.nextUrl.searchParams
    const externalUrl = new URL([env.API_CANARY, ALL_RECORDS_PATH].join("/"))
    params.forEach((value, key) => {
      externalUrl.searchParams.set(key, value)
    })
    console.log(`Searching records: ${externalUrl}`)
    // TODO: Implement a tag for the request, so that we easily identify what recordings are being cached. Also revalidation can be easier. READ THE DOCS
    const [err, res] = await _get(externalUrl.toString(), headers, {
      expectJson: true,
      cacheResponse: true,
    })
    const responseHeaders = getHeaders(await getHost())
    if (err !== null) {
      if (
        // @ts-ignore
        err.detail ===
        "Error al obtener los registros: 404: No se encontraron registros"
      ) {
        return NextResponse.json([null, []], { status: 200 })
      }
      console.error(err)
      // @ts-ignore
      // API hasn't changed yet to return a normalized response, we have to access the detail key if it returns an error
      return NextResponse.json([err.detail, []], {
        status: 500,
      })
    }
    // API never falls back to this clause because when it returns a good response but with no content, it treats it as an error
    if (res === null) {
      return NextResponse.json([null, []], { status: 200 })
    }
    const response = await res.json()
    if (res.ok) {
      return NextResponse.json([null, response], {
        status: 200,
        headers: responseHeaders,
      })
    }
    return NextResponse.json([err, []], { status: 500 })
  } catch (error) {
    console.error(error)
    return NextResponse.json([error, []], { status: 500 })
  }
}
