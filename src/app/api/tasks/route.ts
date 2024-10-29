import { ALL_TASKS_PATH, SPEECH_TO_TEXT_PATH } from "@/server-constants"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { _get, _post, _put } from "@/lib/fetcher"
import { Tasks } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"
// import fs from "fs/promises"
export async function GET() {
  const url = [
    env.API_MAIN,
    ALL_TASKS_PATH,
    //  "/not_valid_endpoint" // Uncomment to force 404 on server
  ].join("/")

  const [err, res] = await _get(url, undefined, { cacheResponse: false })
  const responseHeaders = getHeaders(await getHost(), AllowedContentTypes.Json)
  /**
   * If you want to use the mock data, uncomment the following lines and comment the lines below.
   */
  // const mockTasks = await fs.readFile("./public/mock/updated_tasks.json")
  // return NextResponse.json(
  //   [null, mockTasks ? JSON.parse(mockTasks.toString()) : []],
  //   {
  //     status: 200,
  //     headers,
  //     statusText: "Mock",
  //   }
  // )

  /** Type guard to check if cause has a code property */
  function hasErrorCode(cause: any): cause is { code: string } {
    return cause && typeof cause.code === "string"
  }
  if (err !== null) {
    let errorCode = "Unknown error code"

    if (hasErrorCode(err.cause)) {
      errorCode = err.cause.code
    }

    console.error("Error cause: ", err.cause)
    console.error("Error code: ", errorCode)

    return NextResponse.json([null, []], {
      status: 404,
      headers: responseHeaders,
      statusText: err.message,
    })
  }
  if (res === null) {
    return NextResponse.json([null, []], {
      status: 200,
      headers: responseHeaders,
    })
  }
  if (res.ok) {
    const tasks: Tasks = (await res.json()).tasks
    return NextResponse.json([null, tasks], {
      status: 200,
      headers: responseHeaders,
    })
  }
  return NextResponse.json([null, []], {
    status: 500,
    statusText: res.statusText,
    headers: responseHeaders,
  })
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file")

  // Check if the Content-Type includes "multipart/form-data"
  const contentType = request.headers.get("Content-Type")
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return NextResponse.json(["Unsupported Media Type", null], {
      status: 415,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }

  if (file instanceof File && file.size > 10000000) {
    return NextResponse.json(["Payload Too Large", null], {
      status: 413,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }

  if (file === null) {
    return NextResponse.json(["No file provided", null], {
      status: 400,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }
  const url = [env.API_MAIN, SPEECH_TO_TEXT_PATH].join("/")
  const [err, res] = await _post(url, formData)
  if (err !== null) {
    return NextResponse.json([err, null], {
      status: 500,
    })
  }

  if (res === null) {
    return NextResponse.json([null, null], {
      status: 200,
    })
  }

  return NextResponse.json([null, res], {
    status: 200,
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { identifier, language } = body
  const url = [env.API_CANARY, "task", identifier]
    .join("/")
    .concat(`?lang=${language}`)
  const [err, res] = await _put(url, body)
  return NextResponse.json([err, res], {
    status: 200,
    headers: getHeaders(await getHost(), AllowedContentTypes.Json),
  })
}
