import { getHeaders } from "@/lib/get-headers"
import { NextRequest, NextResponse } from "next/server"

export const unauthorizedResponse = async function (request: NextRequest) {
  return NextResponse.json(
    { error: "Unauthorized" },
    {
      status: 401,
      headers: await getHeaders(request),
    }
  )
}
