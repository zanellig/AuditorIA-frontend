import { SPEAKER_ANALYSIS_PATH, TASK_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import { extractJsonFromString } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  const id = request.nextUrl.searchParams.get("identifier")
  if (!id) {
    return NextResponse.json(
      [
        new Error("ID was not provided", {
          cause: "Bad request",
        }),
        null,
      ],
      { status: 400, headers }
    )
  }
  const url = [env.API_CANARY, TASK_PATH, SPEAKER_ANALYSIS_PATH, id].join("/")
  const [err, res] = await _get(url, undefined, { cacheResponse: true })

  if (err !== null) {
    return NextResponse.json(err, {
      status: 500,
      statusText: "", // TODO: add a documented error message
      headers,
    })
  }
  if (res !== null && res.ok) {
    const data = await res?.json()
    const llmResult = extractJsonFromString(data?.processed_result)
    return NextResponse.json(llmResult, {
      status: 200,
      headers,
    })
  }
  return NextResponse.json(null, {
    status: 404,
    statusText: "", // TODO: add a documented error message
    headers,
  })
}
