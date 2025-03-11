import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getHost } from "@/lib/actions"

export async function GET() {
  try {
    // Create a sample notification
    const notification = {
      uuid: randomUUID(),
      timestamp: Date.now(),
      read: false,
      text: "This is a test notification",
      task: {
        identifier: "test-identifier",
        file_name: "test-file.mp3",
      },
    }

    // Send the notification to the webhook
    const response = await fetch(
      `${await getHost()}/api/notifications/webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to create test notification")
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating test notification:", error)
    return NextResponse.json(
      { error: "Failed to create test notification" },
      { status: 500 }
    )
  }
}
