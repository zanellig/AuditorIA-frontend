import { NextRequest, NextResponse } from "next/server"
import { getHeaders } from "@/lib/get-headers"
import { updateWebhookSchema } from "@/lib/models/webhook"
import {
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  DuplicateWebhookNameError,
} from "@/lib/repositories/webhook-repository"

// Interface for route parameters (webhook ID)
interface Props {
  params: {
    id: string
  }
}

// Allow OPTIONS requests (CORS)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

// GET a specific webhook
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid webhook ID" },
        { status: 400, headers: await getHeaders(request) }
      )
    }

    const webhook = await getWebhookById(id)

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404, headers: await getHeaders(request) }
      )
    }

    return NextResponse.json(webhook, {
      headers: await getHeaders(request),
    })
  } catch (error) {
    console.error("Error fetching webhook:", error)
    return NextResponse.json(
      { error: "Failed to fetch webhook" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}

// PATCH to update a specific webhook
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid webhook ID" },
        { status: 400, headers: await getHeaders(request) }
      )
    }

    const body = await request.json()

    // Add ID to the request body
    const data = { ...body, id }

    // Validate request body
    const result = updateWebhookSchema.safeParse(data)
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

// DELETE a specific webhook
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid webhook ID" },
        { status: 400, headers: await getHeaders(request) }
      )
    }

    const success = await deleteWebhook(id)

    if (!success) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404, headers: await getHeaders(request) }
      )
    }

    return NextResponse.json(
      { success: true },
      {
        headers: await getHeaders(request),
      }
    )
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500, headers: await getHeaders(request) }
    )
  }
}
