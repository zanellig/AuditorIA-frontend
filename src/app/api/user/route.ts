import { env } from "@/env"
import { getAuthCookie } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { ServerUserData, UserData } from "./user"

export const GET = async function (request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const { tokenType, accessToken } = (await getAuthCookie()) ?? {
      tokenType: "",
      accessToken: "",
    }
    const requestAuthHeaders = request.headers.get("Authorization")
    const authHeader = `${tokenType ? tokenType + " " : ""}${accessToken ? accessToken : ""}${requestAuthHeaders ? " " + requestAuthHeaders : ""}`
    const url = new URL(`${env.API_CANARY_8000}/users/me`)
    console.log(authHeader)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    }).catch(error => {
      throw new Error(error.detail)
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data: ServerUserData = await response.json()
    const userData: UserData = {
      userEmail: data.email,
      username: data.username,
      userFullName: data.full_name,
      isActive: data.is_active,
    }
    return NextResponse.json(userData, {
      headers: responseHeaders,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        userEmail: "unknown@error.com",
        username: "unknown",
        userFullName: "Unknown Error",
        message: error.message,
      },
      { status: 500, statusText: error.message, headers: responseHeaders }
    )
  }
}
