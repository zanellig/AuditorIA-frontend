import { ALL_RECORDS_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import { getHeaders } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"
import { RecordingsAPIResponse } from "@/lib/types"
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const externalUrl = new URL([env.API_CANARY, ALL_RECORDS_PATH].join("/"))
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
          })
        }
        // @ts-expect-error
        // API hasn't changed yet to return a normalized response, we have to access the detail key if it returns an error
        return NextResponse.json([err.detail, []], {
          status: 500,
        })
      }
      return NextResponse.json([err, []], {
        status: 500,
      })
    }
    // API never falls back to this clause because when it returns a good response but with no content, it treats it as an error
    if (res === null) {
      return NextResponse.json([null, []], {
        status: 200,
      })
    }
    if ("records" in res) {
      return NextResponse.json([null, res.records], {
        status: 200,
      })
    }
    return NextResponse.json([null, res], {
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json([error, []], {
      status: 500,
    })
  }
}
