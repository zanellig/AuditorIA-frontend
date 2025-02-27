import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const headers = await getHeaders(request)

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS"
  if (isPreflight)
    return NextResponse.next({
      headers,
    })

  const authenticated = await isAuthenticated()
  if (!authenticated)
    return NextResponse.redirect(new URL("/login", request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
