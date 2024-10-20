import { ALL_RECORDS_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import {
  extractQueryParamsFromUrl,
  getHeaders,
  concatParamsToUrlString,
} from "@/lib/utils"
import { NextRequest } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"

export async function GET(request: NextRequest) {
  const headers = getHeaders(env.API_CANARY)
  // It could have been done easier by removing everything after the ? and parsing it, but I prefer to have the utils just in case...
  // Basically, it extracts the query params from the URL we pass in the request and concatenates them to the URL we're going to pass to the API
  // Additionally, we might have other things in the URL later that aren't params, so to avoid future problems we do it this way, and if we need to change it later, we change it here and nowhere else
  const params = extractQueryParamsFromUrl(request.nextUrl.search)
  const baseUrl = [env.API_CANARY, ALL_RECORDS_PATH].join("/")
  const url = concatParamsToUrlString(baseUrl, params)
  console.log(url)
  const [err, res] = await _get(url, headers, { revalidate: true })
  const responseHeaders = getHeaders(await getHost())
  if (err !== null) {
    if (
      // @ts-ignore
      err.detail ===
      "Error al obtener los registros: 404: No se encontraron registros"
    ) {
      return new Response(JSON.stringify([null, []]), { status: 204 })
    }
    // @ts-ignore
    // API hasn't changed yet to return a normalized response, we have to access the detail key if it returns an error
    return new Response(JSON.stringify([JSON.stringify(err.detail), null]), {
      status: 500,
    })
  }
  // API never falls back to this clause because when it returns a good response but with no content, it treats it as an error
  if (res === null) {
    return new Response(JSON.stringify([null, []]), { status: 204 })
  }
  const response = await res.json()
  if (res.ok) {
    return new Response(JSON.stringify([null, response]), {
      status: 200,
      headers: responseHeaders,
    })
  }
  return new Response(JSON.stringify([err, []]), { status: 500 })
}
