// @/app/api/audio/route.ts
import "server-only"
import { type NextRequest, NextResponse } from "next/server"
import { getNetworkAudio } from "@/lib/audio"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")
  if (!path) {
    return new NextResponse("Missing path parameter", { status: 400 })
  }
  const [err, audioBuffer] = await getNetworkAudio(path)
  if (audioBuffer === null) {
    return new NextResponse("No audio found on the path", { status: 204 })
  }
  if (err !== null) {
    return new NextResponse(err.message, { status: 500 })
  }
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
    status: 200,
  })
}
