import { env } from "@/env"
import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"

export async function OPTIONS(request: NextRequest) {
  const headers = await getHeaders(request)
  return NextResponse.json({}, { headers })
}

const urlMap = {
  whisperUrl: "API_MAIN",
  auditUrl: "API_CANARY_8000",
}

export async function PUT(request: NextRequest) {
  const updatedEnvVars: Record<string, string> = {}
  try {
    const formData = await request.formData()
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
      if (!value) throw new Error(`Value for ${key} is empty`)

      // Check if the key exists in our urlMap
      const envKey = urlMap[key as keyof typeof urlMap]
      if (!envKey) {
        throw new Error(`Invalid URL key: ${key}`)
      }

      // Normalize and update the URL
      const normalizedUrl = normalizeUrl({ url: value.toString() })
      ;(process.env[envKey as keyof typeof process.env] as any) = normalizedUrl
        .toString()
        .replace(/\/+$/, "")
      ;(env[envKey as keyof typeof env] as any) = normalizedUrl
        .toString()
        .replace(/\/+$/, "")
      updatedEnvVars[key] = normalizedUrl.toString()
    }
  } catch (error) {
    console.error(error)
    return new NextResponse("Error processing URL updates", {
      status: 400,
    })
  }
  return NextResponse.json("OK", { status: 200 })
}

function normalizeUrl({ url }: { url: string }): URL {
  // Add default protocol if missing
  const urlWithProtocol = url.match(/^[a-zA-Z]+:\/\//) ? url : `http://${url}`

  // Create URL object and remove trailing slashes
  const urlObject = new URL(urlWithProtocol)
  urlObject.pathname = urlObject.pathname.replace(/\/+$/, "")

  return urlObject
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    auditUrl: process.env.API_CANARY_8000,
    whisperUrl: process.env.API_MAIN,
  })
}
