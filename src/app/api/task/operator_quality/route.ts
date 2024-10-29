import { OPERATOR_QUALITY_PATH, TASK_PATH } from "@/server-constants"
import { _get } from "@/lib/fetcher"
import {
  AllowedContentTypes,
  extractJsonFromString,
  getHeaders,
} from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"

export async function GET(request: NextRequest) {
  const reponseHeaders = getHeaders(await getHost(), AllowedContentTypes.Json)
  const id = request.nextUrl.searchParams.get("identifier")
  if (!id) {
    return NextResponse.json(
      [
        new Error("ID was not provided", {
          cause: "Bad request",
        }),
        null,
      ],
      { status: 400, headers: reponseHeaders }
    )
  }
  const url = [env.API_CANARY, TASK_PATH, OPERATOR_QUALITY_PATH, id].join("/")
  const [err, res] = await _get(url, undefined, { cacheResponse: true })

  if (err !== null) {
    return NextResponse.json(err, {
      status: 500,
      statusText: "", // TODO: add a documented error message
      headers: reponseHeaders,
    })
  }
  if (res !== null && res.ok) {
    const data = await res?.json()
    const llmResult = extractJsonFromString(data?.processed_result)
    return NextResponse.json(llmResult, {
      status: 200,
    })
  }
  return NextResponse.json(null, {
    status: 404,
    statusText: "", // TODO: add a documented error message
    headers: reponseHeaders,
  })
}
