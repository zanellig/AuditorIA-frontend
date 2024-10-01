import { _get, _post } from "@/lib/fetcher"
import { API_MAIN, SPEECH_TO_TEXT_PATH, TASK_PATH } from "@/lib/consts"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { TaskPOSTResponse } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"

export const revalidate = 5

const TASK_API = [API_MAIN, TASK_PATH].join("/")
const SPEECH_TO_TEXT_API = [API_MAIN, SPEECH_TO_TEXT_PATH].join("/")

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const identifier = request.nextUrl.searchParams.get("identifier")

  const headers = getHeaders(API_MAIN, AllowedContentTypes.Json)
  if (!identifier) {
    return new NextResponse(
      JSON.stringify([new Error("Task ID was not provided"), null]),
      {
        status: 400,
        headers: headers,
        statusText: "Task ID was not provided",
      }
    )
  }
  // transform into array
  const reqUrl = [API_MAIN, TASK_PATH, identifier].join("/")

  const [err, res] = await _get(reqUrl, headers, {
    revalidate: true,
    expectJson: true,
  })
  if (err !== null) {
    /**
     * The ECONNREFUSED (Connection refused) could fall in this case if the server is not running, but we can't access that error message,
     * as far as I know.
     *
     * The message, stack, cause and name don't show anything useful, but if we log the error, we can see that the error message is
     * "ECONNREFUSED".
     *
     * We return a generic 500 error, as we don't want to leak information about the server, but we should improve this.
     * Maybe returning a 503, 522 or 523; I don't know which one is the best fit.
     * */
    return new NextResponse(JSON.stringify([err.message, null]), {
      status: 500,
      headers: headers,
      statusText: "Unknown internal server error while fetching task.",
    })
  }
  if (res === null) {
    return new NextResponse(
      JSON.stringify([new Error("Task not found."), null]),
      {
        status: 404,
        headers: headers,
        statusText: "Task not found.",
      }
    )
  }
  if (res.ok) {
    return new NextResponse(JSON.stringify([null, res]), {
      status: 200,
      headers: headers,
      statusText: "Task fetched successfully.",
    })
  }
  return new NextResponse(
    JSON.stringify([new Error("Unknown error fetching task."), null]),
    {
      status: 500,
      headers: headers,
      statusText: "Unknown error fetching task.",
    }
  )
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
      status: 500,
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
