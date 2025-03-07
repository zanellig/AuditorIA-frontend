// @/app/api/audio/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getNetworkAudio } from "@/lib/audio"
import { getHeaders } from "@/lib/get-headers"

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const headers = await getHeaders(request)
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    if (!path) {
      return NextResponse.json(new Error("Missing path parameter"), {
        status: 400,
        headers,
      })
    }
    const result = await getNetworkAudio(path)
    if (result.buffer === null) {
      return NextResponse.json(new Error("No audio found in the path"), {
        status: 404,
        headers,
      })
    }
    if (result.error !== null) {
      throw new Error(result.error.message)
    }
    return new NextResponse(result.buffer, {
      headers: {
        ...headers,
        "Content-Type": result.mimeType ?? "audio/mpeg",
      },
      status: 200,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500, headers })
  }
}
