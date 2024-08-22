import { API_CANARY, SPEAKER_ANALYSIS_PATH, TASK_PATH } from "@/lib/consts"
import { _get } from "@/lib/fetcher"
import { getHeaders } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("identifier")
  if (!id) {
    return new NextResponse(
      JSON.stringify([
        new Error("ID was not provided", {
          cause: "Bad request",
        }),
        null,
      ]),
      { status: 400 }
    )
  }
  const url = [API_CANARY, TASK_PATH, SPEAKER_ANALYSIS_PATH, id].join("/")
  const headers = getHeaders(API_CANARY)

  const [err, res] = await _get(url, headers)

  if (err !== null) {
    return new NextResponse(JSON.stringify([err, null]), {
      status: err.status || 500,
    })
  }
  if (res !== null && res.ok) {
    const data = await res?.json()
    return new NextResponse(JSON.stringify([null, data]), {
      status: 200,
    })
  }
  return new NextResponse(JSON.stringify([null, null]), {
    status: 404,
  })
}
