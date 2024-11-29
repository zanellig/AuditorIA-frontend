// app/api/login/route.ts
import { env } from "@/env"
import { AuthTokens, setAuthCookie } from "@/lib/auth"
import { loginFormSchema } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { UserData } from "../user/user"

export async function POST(request: NextRequest) {
  // TODO: Implement HTTPS to encrypt data in transit and at rest
  // TODO: Implement rate limiting to prevent brute force attacks
  const responseHeaders = await getHeaders(request)
  try {
    const body: z.infer<typeof loginFormSchema> = await request.json()
    const validatedBody = loginFormSchema.safeParse(body)
    if (!validatedBody.success) {
      return NextResponse.json(
        { message: validatedBody.error.issues[0].message },
        {
          status: 400,
          statusText: "The request body is not valid",
          headers: responseHeaders,
        }
      )
    }

    // Create URLSearchParams for form data
    const formData = new URLSearchParams()
    formData.append("username", validatedBody.data.username)
    formData.append("password", validatedBody.data.password)

    const response = await fetch(`${env.API_CANARY_8000}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }).catch(e => {
      throw new Error(e.detail)
    })
    console.log(
      "Response status from API on (login/route.ts):",
      response.status,
      response.statusText
    )
    const tokenData: AuthTokens = await response.json()
    console.log("Setting cookie with data (login/route.ts):", tokenData)
    await setAuthCookie(tokenData)

    // Get user data to display welcome message in the frontend
    const host = `http://localhost:${env.PORT}`
    const userResponse = await fetch(`${host}/api/user`, {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    })
    console.log(
      "Response from internal user proxy on (login/route.ts):",
      userResponse.status,
      userResponse.statusText
    )
    if (!userResponse.ok) {
      throw new Error(userResponse.statusText)
    }
    const userData: UserData = await userResponse.json()
    console.log("Data retrieved from internal user proxy:", userData)

    return NextResponse.json(userData, {
      status: response.status,
      headers: {
        ...(await getHeaders(request)),
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e)
    return NextResponse.json(
      { message: e.message },
      { status: 500, headers: responseHeaders }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const responseHeaders = await getHeaders(request)
  return new NextResponse("", {
    headers: responseHeaders,
    status: 200,
  })
}
