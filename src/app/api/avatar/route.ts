import { env } from "@/env"
import { getAuthCookie, isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const { tokenType, accessToken } = (await getAuthCookie()) ?? {
      tokenType: "",
      accessToken: "",
    }
    const requestAuthHeaders = request.headers.get("Authorization")
    const authHeader = `${tokenType ? tokenType + " " : ""}${accessToken ? accessToken : ""}${requestAuthHeaders ? " " + requestAuthHeaders : ""}`
    const url = new URL(`${env.API_CANARY_8000}/users/avatar`)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `${authHeader}`,
        Accept: "*/*",
      },
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          statusText: response.statusText,
          status: response.status,
        })
      )
    }
    const body = await response.blob()

    return new NextResponse(body, {
      headers: {
        ...responseHeaders,
        "Content-Type": response.headers.get("content-type") ?? "",
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const { status, statusText } = JSON.parse(error.message)
    return NextResponse.json(
      { message: error.message },
      { status, statusText, headers: responseHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  return NextResponse.json({})
}

// http://10.20.30.108:8000/users/avatar/update > Authorization header with bearer token
export async function PUT(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    if (!(await isAuthenticated()))
      return NextResponse.json({}, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400, headers: responseHeaders }
      )
    }

    const { tokenType, accessToken } = (await getAuthCookie()) ?? {
      tokenType: "",
      accessToken: "",
    }

    const serverFormData = new FormData()
    serverFormData.append("file", file)

    const response = await fetch(`${env.API_CANARY_8000}/users/avatar/update`, {
      method: "PUT",
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
      body: serverFormData,
    })

    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          statusText: response.statusText,
          status: response.status,
        })
      )
    }

    return new NextResponse(null, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error("Error updating avatar:", error)
    const { status = 500, statusText = "Internal Server Error" } = JSON.parse(
      error.message || "{}"
    )
    return NextResponse.json(
      { message: error.message },
      { status, statusText, headers: responseHeaders }
    )
  }
}
