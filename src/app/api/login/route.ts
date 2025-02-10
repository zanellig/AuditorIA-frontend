import { env } from "@/env"
import { AuthTokens, setAuthCookie } from "@/lib/auth"
import { loginFormSchema } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

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
    if (!response.ok)
      throw new Error(
        (await response.json().then(e => e.detail)) ?? "Error iniciando sesión"
      )
    const tokenData: AuthTokens = await response.json()
    console.log("Setting cookie with data (login/route.ts):", tokenData)
    await setAuthCookie(tokenData)

    return NextResponse.json({ ok: true }, { headers: responseHeaders })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message },
      { status: 500, headers: responseHeaders }
    )
  }
}
