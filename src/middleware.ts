import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { isAuthenticated, setRedirectPathCookie } from "@/lib/auth"
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
    const response = NextResponse.redirect(new URL("/login", request.url), {
      headers,
    })
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

  return NextResponse.next({ headers })
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

/* When trying to execute the setRedirectPathCookie function, the following error is thrown:
  ev [Error]: Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options

    at Proxy.callable (/app/.next/server/src/middleware.js:13:13329)

    at nG (/app/.next/server/src/middleware.js:13:109581)

    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)

    at async Object.middleware (/app/.next/server/src/middleware.js:13:111074)

    at async eK (/app/.next/server/src/middleware.js:13:25003)

    at async /app/node_modules/next/dist/server/web/sandbox/sandbox.js:110:22

    at async runWithTaggedErrors (/app/node_modules/next/dist/server/web/sandbox/sandbox.js:107:9)

    at async NextNodeServer.runMiddleware (/app/node_modules/next/dist/server/next-server.js:1068:24)

    at async NextNodeServer.handleCatchallMiddlewareRequest (/app/node_modules/next/dist/server/next-server.js:322:26)

    at async NextNodeServer.handleRequestImpl (/app/node_modules/next/dist/server/base-server.js:823:28)

Error [ERR_HTTP_HEADERS_SENT]: Cannot append headers after they are sent to the client

    at ServerResponse.appendHeader (node:_http_outgoing:711:11)

    at /app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:24560

    at _Headers.forEach (node:internal/deps/undici/undici:4582:26)

    at m (/app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:16:24542)

    at P (/app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:83073)

    at nq (/app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:69673)

    at n1 (/app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:81756)

    at AsyncLocalStorage.run (node:async_hooks:346:14)

    at Timeout._onTimeout (/app/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:87776)

    at listOnTimeout (node:internal/timers:581:17) {

  code: 'ERR_HTTP_HEADERS_SENT',

  digest: '3240291587'

}
*/
