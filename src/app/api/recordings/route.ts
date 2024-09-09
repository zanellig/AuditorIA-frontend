import { ALL_RECORDS_PATH, API_CANARY } from "@/lib/consts"
import { _get } from "@/lib/fetcher"
import { Recordings } from "@/lib/types"
import {
  extractQueryParamsFromUrl,
  getHeaders,
  concatParamsToUrlString,
} from "@/lib/utils"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const headers = getHeaders(API_CANARY)
  // puede haberse hecho más fácil, sacando todo lo que esté después del ? y parseandolo, pero prefiero tener las utils por las dudas...
  // básicamente extrae los queryparams de la url que le pasamos en el request y se los concatena a la url que le vamos a pasar a la api
  // además, nos puede pasar que más adelante tengamos otras cosas en la url que no sean params, entonces para evitar futuros problemas lo hacemos así y después si lo tenemos que cambiar, lo cambiamos acá y nada más
  const params = extractQueryParamsFromUrl(request.nextUrl.search)
  const baseUrl = [API_CANARY, ALL_RECORDS_PATH].join("/")
  const url = concatParamsToUrlString(baseUrl, params)
  console.log(
    "we've hit the recordings route for the internal API",
    params,
    baseUrl,
    url
  )
  const [err, res] = await _get(url, headers, { revalidate: true })
  const responseHeaders = new Headers()
  responseHeaders.append("Access-Control-Allow-Origin", API_CANARY)
  responseHeaders.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  responseHeaders.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  responseHeaders.append("Content-Type", "application/json")

  if (err !== null) {
    return new Response(JSON.stringify([JSON.stringify(err), null]), {
      status: 500,
    })
  }
  if (res === null) {
    return new Response("No content", { status: 204 })
  }
  const response = await res.json()
  if (res.ok) {
    return new Response(JSON.stringify([null, response]), {
      status: 200,
      headers: responseHeaders,
    })
  }
  return new Response("Unexpected error", { status: 500 })
}
