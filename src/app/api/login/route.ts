// app/api/login/route.ts
import { env } from "@/env"
import { AuthTokens, isAuthenticated, setAuthCookie } from "@/lib/auth"
import { loginFormSchema } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function POST(request: NextRequest) {
  // TODO: Implement HTTPS to encrypt data in transit and at rest
  // TODO: Implement rate limiting to prevent brute force attacks
  const responseHeaders = await getHeaders(request)
  try {
    if (await isAuthenticated())
      return NextResponse.json(
        { message: "Logged in" },
        { status: 200, statusText: "Logged in", headers: responseHeaders }
      )

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

    const data: AuthTokens = await response.json()
    await setAuthCookie(data)
    return NextResponse.json(validatedBody.data, {
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
