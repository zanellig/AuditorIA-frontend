import { ALL_TASKS_PATH, API_MAIN } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { _get } from "@/lib/fetcher"
import { Tasks } from "@/lib/types.d"

export async function GET(request: Request) {
  const headers = getHeaders(API_MAIN)
  const url = [API_MAIN, ALL_TASKS_PATH].join("/")
  const [err, res] = await _get(url, headers, { revalidate: true })

  const responseHeaders = new Headers()
  responseHeaders.append("Access-Control-Allow-Origin", API_MAIN)
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
  if (res.ok) {
    const tasks = await res.json()
    return new Response(JSON.stringify([null, tasks]), {
      status: 200,
      headers: responseHeaders,
    })
  }
  return new Response("Unexpected error", { status: 500 })
}
