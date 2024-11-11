// app/api/login/route.ts
import { env } from "@/env"
import { loginFormSchema } from "@/lib/forms"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body: z.infer<typeof loginFormSchema> = await request.json()
    const validatedBody = loginFormSchema.safeParse(body)
    if (!validatedBody.success) {
      return NextResponse.json(validatedBody.error.format(), {
        status: 400,
        statusText: "The request body is not valid",
      })
    }

    // Create URLSearchParams for form data
    const formData = new URLSearchParams()
    formData.append("username", body.username)
    formData.append("password", body.password)

    const response = await fetch(`${env.API_CANARY_8000}/token`, {
      method: "POST",
      headers: {
        ...(await getHeaders(request)),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const data = await response.json()
    console.log(data)

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: "Error logging in" }, { status: 500 })
  }
}
