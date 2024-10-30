import "server-only"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { ALLOWED_ORIGINS } from "@/server-constants"

// Application Types
const applicationTypes = z.enum([
  "application/json",
  "application/x-www-form-urlencoded",
  "application/xml",
  "application/pdf",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/javascript",
  "application/octet-stream",
])

// Text Types
const textTypes = z.enum([
  "text/plain",
  "text/html",
  "text/css",
  "text/csv",
  "text/xml",
  "text/markdown",
])

// Image Types
const imageTypes = z.enum([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/avif",
])

// Audio Types
const audioTypes = z.enum([
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
])

// Video Types
const videoTypes = z.enum(["video/mp4", "video/webm", "video/ogg"])

// Multipart Types
const multipartTypes = z.enum(["multipart/form-data", "multipart/byteranges"])

// Combined Content Type Schema
export const ContentTypeSchema = z.union([
  applicationTypes,
  textTypes,
  imageTypes,
  audioTypes,
  videoTypes,
  multipartTypes,
])

// Type extraction
export type ContentType = z.infer<typeof ContentTypeSchema>

export async function getHeaders(request: NextRequest) {
  const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
  }

  // For preflight requests (OPTIONS)
  if (request.method === "OPTIONS") {
    return NextResponse.json(null, {
      status: 204, // No content needed for OPTIONS
      headers: {
        ...corsOptions,
      },
    })
  }

  const responseHeaders = new Headers()

  // Validate and set Content-Type from request
  const requestContentType = request.headers.get("content-type")
  if (requestContentType) {
    // Extract base content type without parameters
    const baseContentType = requestContentType.split(";")[0].trim()
    const contentTypeResult = ContentTypeSchema.safeParse(baseContentType)

    if (contentTypeResult.success) {
      if (baseContentType.startsWith("text/")) {
        responseHeaders.set("Content-Type", `${baseContentType}; charset=utf-8`)
      } else {
        responseHeaders.set("Content-Type", baseContentType)
      }
    }
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    responseHeaders.set(key, value)
  })

  return responseHeaders
}

// Usage example with type checking
export const validateContentType = (contentType: string) => {
  return ContentTypeSchema.safeParse(contentType)
}
