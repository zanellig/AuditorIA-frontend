import { ALL_TASKS_PATH, API_MAIN, SPEECH_TO_TEXT_PATH } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { _get, _post } from "@/lib/fetcher"
import { Tasks } from "@/lib/types.d"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const headers = getHeaders(API_MAIN)
  const url = [API_MAIN, ALL_TASKS_PATH].join("/")
  const [err, res] = await _get(url, headers)

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
    return new Response(JSON.stringify([null, "No content"]), { status: 204 })
  }
  if (res.ok) {
    const tasks: Tasks = (await res.json()).tasks
    return new Response(JSON.stringify([null, tasks]), {
      status: 200,
      headers: responseHeaders,
    })
  }
  return new Response(JSON.stringify(["Unexpected error", null]), {
    status: 500,
  })
}

export async function POST(request: NextRequest) {
  const headers = getHeaders(API_MAIN)
  const url = [API_MAIN, SPEECH_TO_TEXT_PATH].join("/")
  const [err, res] = await _post(url, request.body, headers)

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
  console.log(err, res);
  return new Response(JSON.stringify([err, res]), {
    status: 200,
    headers: responseHeaders,
  })
}
