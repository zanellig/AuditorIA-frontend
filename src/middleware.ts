import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { getAuthCookie, isAuthenticated } from "@/lib/auth"

const REDIRECT_COOKIE_NAME = "redirect_path"

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS"
  if (isPreflight) return NextResponse.next()

  const isApiRequest = request.nextUrl.pathname.startsWith("/api")
  if (isApiRequest) {
    const authCookie = await getAuthCookie()

    if (!authCookie) {
      return NextResponse.next()
    }

    const { tokenType, accessToken } = authCookie

    // we don't check if the token is expired, we just append the token to the request's auth header
    const response = NextResponse.next()

    if (tokenType && accessToken) {
      response.headers.set("Authorization", `${tokenType} ${accessToken}`)
    }

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

  const isAdminRequest =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/dashboard/settings")

  if (isAdminRequest) {
    const isAuthorized = request.cookies.get("admin")
    if (!isAuthorized) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/admin/:path*",
    "/dashboard/settings/:path*",
  ],
}
