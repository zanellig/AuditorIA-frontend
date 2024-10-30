// @/app/api/audio/route.ts
import "server-only"
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
  const { searchParams } = new URL(request.url)
  const headers = await getHeaders(request)
  if (headers instanceof NextResponse) return headers
  const path = searchParams.get("path")
  if (!path) {
    return new NextResponse(
      JSON.stringify(new Error("Missing path parameter.")),
      { status: 400, headers }
    )
  }
  const [err, audioBuffer] = await getNetworkAudio(path)
  if (audioBuffer === null) {
    return new NextResponse(
      JSON.stringify(new Error("No audio found in the path.")),
      { status: 404, headers }
    )
  }
  if (err !== null) {
    return new NextResponse(err.message, { status: 500 })
  }
  return new NextResponse(audioBuffer, {
    headers: {
      ...headers,
      "Content-Type": "audio/mpeg",
    },
    status: 200,
  })
}
