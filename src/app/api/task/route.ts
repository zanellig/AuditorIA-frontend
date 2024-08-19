import { _get, _post, _put, _delete, _patch } from "@/lib/fetcher"
import { API_MAIN, SPEECH_TO_TEXT_PATH, TASK_PATH } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { Task, TaskPOSTResponse } from "@/lib/types.d"

export const revalidate = 5

const TASK_API = [API_MAIN, TASK_PATH].join("/")
const SPEECH_TO_TEXT_API = [API_MAIN, SPEECH_TO_TEXT_PATH].join("/")

export async function GET(request: Request) {
  const url = new URL(request.url)
  const identifier = url.searchParams.get("identifier")
  const headers = getHeaders(API_MAIN)

  if (!identifier) {
    return new Response("Task ID not found", { status: 400 })
  }
  const reqUrl = `${API_MAIN}/${TASK_PATH}/${identifier}`

  const response = await _get<Task>(reqUrl, headers)

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": url.origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
export async function POST(request: Request) {
  const headers = getHeaders(API_MAIN)
  const data = await request.formData()
  const [err, res] = await _post<TaskPOSTResponse>(
    SPEECH_TO_TEXT_API,
    data,
    headers,
    {
      revalidate: true,
      expectJson: true,
    }
  )
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
    return new Response(JSON.stringify(err), {
      status: err.status || 500,
      headers: responseHeaders,
    })
  }
  return new Response(JSON.stringify(res), {
    status: 201,
    headers: responseHeaders,
  })
}

/*
{"identifier":"c20c5808-f0a8-4697-a0ed-8a856b7fa2eb","message":"Task queued"}
*/
