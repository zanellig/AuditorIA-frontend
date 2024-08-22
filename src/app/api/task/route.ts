import { _get, _post } from "@/lib/fetcher"
import { API_MAIN, SPEECH_TO_TEXT_PATH, TASK_PATH } from "@/lib/consts"
import { getHeaders } from "@/lib/utils"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"

export const revalidate = 5

const TASK_API = [API_MAIN, TASK_PATH].join("/")
const SPEECH_TO_TEXT_API = [API_MAIN, SPEECH_TO_TEXT_PATH].join("/")

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const identifier = request.nextUrl.searchParams.get("identifier")

  const headers = getHeaders(API_MAIN)
  if (!identifier) {
    return new NextResponse(
      JSON.stringify([new Error("Task ID was not provided"), null]),
      { status: 400 }
    )
  }
  // transform into array
  const reqUrl = [API_MAIN, TASK_PATH, identifier].join("/")

  const [err, res] = await _get(reqUrl, headers, {
    revalidate: true,
    expectJson: true,
  })
  if (err !== null) {
    return new NextResponse(JSON.stringify([JSON.stringify(err), null]), {
      status: err.status || 500,
    })
  }
  if (res === null) {
    return new NextResponse(JSON.stringify([null, "No content"]), {
      status: 204,
    })
  }
  if (res.ok) {
    return new NextResponse(JSON.stringify([null, res]), { status: 200 })
  }
  return new NextResponse(JSON.stringify([null, res]), { status: 200 })
}
export async function POST(request: NextRequest) {
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
  responseHeaders.append("Access-Control-Allow-Methods", " POST")
  responseHeaders.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  responseHeaders.append("Content-Type", "application/json")
  if (err !== null) {
    return new NextResponse(JSON.stringify([err, null]), {
      status: err.status || 500,
      headers: responseHeaders,
    })
  }
  return new NextResponse(JSON.stringify([null, res]), {
    status: 201,
    headers: responseHeaders,
  })
}

/*
{"identifier":"c20c5808-f0a8-4697-a0ed-8a856b7fa2eb","message":"Task queued"}
*/
