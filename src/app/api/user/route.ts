import { env } from "@/env"
import { getAuthCookie, isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { UserData } from "./user"
import { unauthorizedResponse } from "../unauthorized"

export const GET = async function (request: NextRequest) {
  const authorized = await isAuthenticated()
  if (!authorized) {
    return unauthorizedResponse(request)
  }
  const responseHeaders = await getHeaders(request)
  try {
    const userToken = await getAuthCookie()
    const url = new URL(`${env.API_CANARY_8000}/users/me`)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `${userToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    }).catch(error => {
      throw new Error(error.detail)
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data: UserData = await response.json()
    const userData = {
      userEmail: data.email,
      username: data.username,
      userFullName: data.full_name,
    }
    return NextResponse.json(userData, {
      headers: responseHeaders,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: responseHeaders }
    )
  }
}
