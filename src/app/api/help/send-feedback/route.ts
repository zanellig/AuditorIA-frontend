import { _post } from "@/lib/fetcher"
import { FEEDBACK_PATH } from "@/server-constants"
import { getHeaders } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { getHost } from "@/lib/actions"

export const revalidate = 5

export async function POST(request: NextRequest) {
  const headers = getHeaders(env.API_CANARY)
  const body = new FormData()
  const reqUrl = `${env.API_CANARY}/${FEEDBACK_PATH}`

  const response = await _post<any>(reqUrl, body, headers)

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": `${await getHost()}`,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

/**
 *
 */
