import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import { createWebhookSchema, updateWebhookSchema } from "@/lib/models/webhook"
import {
  getAllWebhooks,
  createWebhook,
  updateWebhook,
  DuplicateWebhookNameError,
} from "@/lib/repositories/webhook-repository"

// Allow OPTIONS requests (CORS)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

// GET all webhooks
export async function GET(request: NextRequest) {
  try {
    const webhooks = await getAllWebhooks()
    return NextResponse.json(webhooks, {
      headers: await getHeaders(request),
    })
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// POST to create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const result = createWebhookSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid webhook data", details: result.error.format() },
        { status: 400, headers: await getHeaders(request) }
      )
    }

    // Create webhook
    const newWebhook = await createWebhook(result.data)

    return NextResponse.json(newWebhook, {
      status: 201,
      headers: await getHeaders(request),
    })
  } catch (error) {
    console.error("Error creating webhook:", error)

    // Check for duplicate name error
    if (error instanceof DuplicateWebhookNameError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409, headers: await getHeaders(request) }
      )
    }

    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// PUT to update an existing webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const result = updateWebhookSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid webhook data", details: result.error.format() },
        { status: 400, headers: await getHeaders(request) }
      )
    }

    // Update webhook
    const updatedWebhook = await updateWebhook(result.data)

    if (!updatedWebhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404, headers: await getHeaders(request) }
      )
    }

    return NextResponse.json(updatedWebhook, {
      headers: await getHeaders(request),
    })
  } catch (error) {
    console.error("Error updating webhook:", error)

    // Check for duplicate name error
    if (error instanceof DuplicateWebhookNameError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409, headers: await getHeaders(request) }
      )
    }

    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}
