import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getHeaders } from "@/lib/get-headers"

const REDIRECT_COOKIE_NAME = "redirect_path"

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const headers = await getHeaders(request)

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS"
  if (isPreflight)
    return NextResponse.next({
      headers,
    })

  const authenticated = await isAuthenticated()

  if (!authenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    response.cookies.set(REDIRECT_COOKIE_NAME, request.nextUrl.pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
