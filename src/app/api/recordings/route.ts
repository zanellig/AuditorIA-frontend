import { ALL_RECORDS_PATH } from "@/server-constants"
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
  if (headers instanceof NextResponse) return headers
  try {
    const params = request.nextUrl.searchParams
    const externalUrl = new URL(
      [env.API_CANARY_7000, ALL_RECORDS_PATH].join("/")
    )
    params.forEach((value, key) => {
      externalUrl.searchParams.set(key, value)
    })
    console.log(`Searching records: ${externalUrl}`)
    const response = await fetch(externalUrl.toString(), {
      method: "GET",
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail)
    }
    const data = await response.json()
    console.log(`Data received from records API:`, data)
    if ("records" in data) {
      return NextResponse.json([null, data.records], {
        status: 200,
        headers,
      })
    }
    return NextResponse.json([null, data], {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json([error, []], {
      status: 500,
      headers,
    })
  }
}
