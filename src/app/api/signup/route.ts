import { env } from "@/env"
import {
  AuthTokens,
  isAuthenticated,
  removeAuthCookie,
  setAuthCookie,
} from "@/lib/auth"
import { signupFormSchema } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function POST(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  try {
    const body: z.infer<typeof signupFormSchema> = await request.json()
    const validatedBody = signupFormSchema.safeParse(body)
    if (!validatedBody.success)
      return NextResponse.json(
        { error: validatedBody.error.message },
        {
          status: 400,
          statusText: "The request body is not valid",
          headers: responseHeaders,
        }
      )
    const url = new URL(`${env.API_CANARY_8000}/register`)
    url.searchParams.append("username", body.username)
    url.searchParams.append("password", body.password)
    url.searchParams.append("email", body.email)
    url.searchParams.append("full_name", body.fullName)
    url.searchParams.append("role_id", body.roleId.toString())

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(e => {
      throw new Error(e.detail)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail)
    }

    const data = await response.json()
    if (data.message) {
      await removeAuthCookie()
      const loginForm = new URLSearchParams()
      loginForm.append("username", body.username)
      loginForm.append("password", body.password)
      const loginResponse = await fetch(`${env.API_CANARY_8000}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: loginForm.toString(),
      }).catch(e => {
        console.log(e, "error on login")
        throw new Error(e.detail)
      })

      if (!loginResponse.ok) {
        const error = await loginResponse.json()
        throw new Error(error.detail)
      }
      const loginData: AuthTokens = await loginResponse.json()
      await setAuthCookie(loginData)
      return NextResponse.json(body, {
        status: loginResponse.status,
        headers: {
          ...(await getHeaders(request)),
        },
      })
    }
    return NextResponse.json(body, {
      status: response.status,
      headers: {
        ...(await getHeaders(request)),
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500, headers: responseHeaders, statusText: error.message }
    )
  }
}
