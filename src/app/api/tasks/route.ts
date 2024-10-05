import { ALL_TASKS_PATH, SPEECH_TO_TEXT_PATH } from "@/server-constants"
import { AllowedContentTypes, getHeaders } from "@/lib/utils"
import { _get, _post, _put } from "@/lib/fetcher"
import { Tasks } from "@/lib/types.d"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"
export async function GET() {
  const headers = getHeaders(env.API_MAIN, AllowedContentTypes.Json)
  const url = [env.API_MAIN, ALL_TASKS_PATH].join("/")
  const [err, res] = await _get(url, headers)

  if (err !== null) {
    return new NextResponse(JSON.stringify([JSON.stringify(err), null]), {
      status: 500,
      headers,
    })
  }
  if (res === null) {
    return new NextResponse(JSON.stringify([null, null]), {
      status: 200,
      headers,
    })
  }
  if (res.ok) {
    const tasks: Tasks = (await res.json()).tasks
    return new NextResponse(JSON.stringify([null, tasks]), {
      status: 200,
      headers,
    })
  }
  return new NextResponse(JSON.stringify(["Unexpected error", null]), {
    status: 500,
    headers,
  })
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file")

  // Check if the Content-Type includes "multipart/form-data"
  const contentType = request.headers.get("Content-Type")
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return new NextResponse(JSON.stringify(["Unsupported Media Type", null]), {
      status: 415,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }

  if (file instanceof File && file.size > 10000000) {
    return new NextResponse(JSON.stringify(["Payload Too Large", null]), {
      status: 413,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }

  if (file === null) {
    return new NextResponse(JSON.stringify(["No file provided", null]), {
      status: 400,
      headers: getHeaders(env.API_MAIN, AllowedContentTypes.Json),
    })
  }

  const headers = getHeaders(env.API_MAIN)
  const url = [env.API_MAIN, SPEECH_TO_TEXT_PATH].join("/")
  const [err, res] = await _post(url, formData, headers)
  const responseHeaders = new Headers()

  responseHeaders.set("Access-Control-Allow-Origin", env.API_MAIN)
  responseHeaders.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  responseHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  responseHeaders.set("Content-Type", "application/json")
  if (err !== null) {
    return new NextResponse(JSON.stringify([JSON.stringify(err), null]), {
      status: 500,
      headers: responseHeaders,
    })
  }

  if (res === null) {
    return new NextResponse(JSON.stringify([null, null]), {
      status: 200,
      headers: responseHeaders,
    })
  }

  return new NextResponse(JSON.stringify([null, res]), {
    status: 200,
    headers: responseHeaders,
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { identifier, language } = body
  const headers = getHeaders(env.API_CANARY, AllowedContentTypes.Json)
  const url = [env.API_CANARY, "task", identifier]
    .join("/")
    .concat(`?lang=${language}`)
  const [err, res] = await _put(url, body, headers)
  return new NextResponse(JSON.stringify([err, res]), {
    status: 200,
    headers: getHeaders(await getHost(), AllowedContentTypes.Json),
  })
}
