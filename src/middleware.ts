import { NextRequest, NextResponse } from "next/server"
import { getHost } from "@/lib/actions"

export async function middleware(request: NextRequest) {
  // Retrieve the server host using the imported getHost function
  const serverHost = await getHost()

  const allowedOrigins = [
    "https://auditoria.linksolution.com.ar",
    "https://auditoria.linksolution.com.ar:3030",
    "https://auditoria.linksolution.com.ar:3000",
    "https://dev.auditoria.linksolution.com.ar",
    "https://qa.auditoria.linksolution.com.ar",
    serverHost,
    serverHost + ":3030",
    serverHost + ":3000",
  ]

  const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  // Check the origin of the request
  const origin = request.headers.get("origin") ?? ""
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle preflight requests (OPTIONS method)
  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "",
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  // Handle simple requests by setting the CORS headers on the response
  const responseHeaders = new Headers()
  if (isAllowedOrigin) {
    responseHeaders.set("Access-Control-Allow-Origin", origin)
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    responseHeaders.set(key, value)
  })

  // Return the response with headers
  return NextResponse.next({
    headers: responseHeaders,
  })
}
