import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"

const REDIRECT_COOKIE_NAME = "redirect_path"

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS"
  if (isPreflight) return NextResponse.next()

  // Add headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const headers = await getHeaders(request)
    const response = NextResponse.next()
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })
    return response
  }

  const authenticated = await isAuthenticated()
  if (!authenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.set(
      REDIRECT_COOKIE_NAME,
      request.nextUrl.pathname + request.nextUrl.search,
      {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 5, // 5 minutes
        path: "/",
        sameSite: "lax",
      }
    )

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
