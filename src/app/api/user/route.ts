import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { ServerUserData, UserData } from "./user"
import { checkIfUserIsAdmin, generateAdminCookie } from "@/lib/server-utils"

export const GET = async function (request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      const response = NextResponse.json(
        { error: "Unauthorized", message: "No auth header found" },
        { status: 401, headers: responseHeaders }
      )
      response.cookies.delete("admin")
      return response
    }

    const url = new URL(`${env.API_CANARY_8000}/users/me`)

    const userApiResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    }).catch(error => {
      throw new Error(JSON.stringify({ statusText: error.detail, status: 500 }))
    })

    if (!userApiResponse.ok) {
      throw new Error(
        JSON.stringify({
          statusText: userApiResponse.statusText,
          status: userApiResponse.status,
        })
      )
    }

    const data: ServerUserData = await userApiResponse.json()
    const userData: UserData = {
      userEmail: data.email ?? "error@auditoria.com.ar",
      username: data.username ?? "error",
      userFullName: data.full_name ?? "John Doe",
      isActive: data.is_active ?? false,
    }

    const response = NextResponse.json(userData, {
      headers: responseHeaders,
    })

    if (checkIfUserIsAdmin(userData.username)) {
      response.cookies.set("admin", generateAdminCookie(userData.username), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
      })
    } else {
      response.cookies.delete("admin")
    }

    return response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const { status, statusText } = JSON.parse(error.message)
    const response = NextResponse.json(
      {
        error: error.message,
        userEmail: "unknown@error.com",
        username: "unknown",
        userFullName: "Unknown Error",
        message: error.message,
      },
      { status, statusText, headers: responseHeaders }
    )
    response.cookies.delete("admin")
    return response
  }
}
