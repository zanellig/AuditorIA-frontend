import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { ServerUserData, UserData } from "./user"

export const GET = async function (request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No auth header found" },
        { status: 401, headers: responseHeaders }
      )
    }

    const url = new URL(`${env.API_CANARY_8000}/users/me`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    }).catch(error => {
      throw new Error(JSON.stringify({ statusText: error.detail, status: 500 }))
    })

    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          statusText: response.statusText,
          status: response.status,
        })
      )
    }

    const data: ServerUserData = await response.json()
    const userData: UserData = {
      userEmail: data.email ?? "error@auditoria.com.ar",
      username: data.username ?? "error",
      userFullName: data.full_name ?? "John Doe",
      isActive: data.is_active ?? false,
    }
    return NextResponse.json(userData, {
      headers: responseHeaders,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const { status, statusText } = JSON.parse(error.message)
    return NextResponse.json(
      {
        error: error.message,
        userEmail: "unknown@error.com",
        username: "unknown",
        userFullName: "Unknown Error",
        message: error.message,
      },
      { status, statusText, headers: responseHeaders }
    )
  }
}
