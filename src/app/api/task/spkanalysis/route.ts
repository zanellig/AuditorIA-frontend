import { SPEAKER_ANALYSIS_PATH, TASK_PATH } from "@/server-constants"
import { extractJsonFromString } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
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
    const url = [
      env.API_CANARY_7000,
      TASK_PATH,
      SPEAKER_ANALYSIS_PATH,
      id,
    ].join("/")
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    if ("processed_result" in data) {
      const llmResult = extractJsonFromString(data?.processed_result)
      return NextResponse.json(llmResult, {
        status: 200,
        headers,
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(null, {
      status: 500,
      statusText: e.message,
      headers,
    })
  }
}
