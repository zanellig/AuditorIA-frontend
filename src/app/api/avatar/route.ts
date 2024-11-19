import { env } from "@/env"
import { getAuthCookie, isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const userToken = await getAuthCookie()
    const url = new URL(`${env.API_CANARY_8000}/users/avatar`)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `${userToken}`,
        Accept: "*/*",
      },
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const body = await response.blob()

    console.log(body)

    return new NextResponse(body, {
      headers: {
        ...responseHeaders,
        "Content-Type": response.headers.get("content-type") ?? "",
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500, headers: responseHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  return NextResponse.json({})
}

export async function PUT(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    if (!(await isAuthenticated()))
      return NextResponse.json({}, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500, headers: responseHeaders }
    )
  }
}
