// Test script to send multiple notifications
const fetch = require("node-fetch")
const { v4: uuidv4 } = require("uuid")

const API_URL = "http://localhost:3000/api/notifications/webhook"

// Sample notification texts
const notificationTexts = [
  "Your transcription is ready",
  "Analysis completed successfully",
  "New task has been assigned to you",
  "System update completed",
  "Reminder: Review pending tasks",
]

// Sample global notification texts
const globalNotificationTexts = [
  "System maintenance scheduled for tomorrow",
  "New feature released: Advanced Analytics",
  "Important: Security update available",
  "Platform update completed successfully",
  "Welcome to the new dashboard experience",
]

// Keep track of sent notification UUIDs to avoid duplicates
const sentNotificationUUIDs = new Set()

// Function to send a notification
async function sendNotification(text, isGlobal = false, delay = 0) {
  // Wait for the specified delay
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Generate a unique UUID that hasn't been used before
  let uuid = uuidv4()
  while (sentNotificationUUIDs.has(uuid)) {
    uuid = uuidv4()
  }
  sentNotificationUUIDs.add(uuid)

  const notification = {
    uuid,
    timestamp: Date.now(),
    read: false,
    text,
    task: {
      identifier: `task-${uuidv4().substring(0, 8)}`,
      file_name: `recording-${Math.floor(Math.random() * 1000)}.mp3`,
    },
    isGlobal: isGlobal,
  }

  // Add userId only for non-global notifications
  if (!isGlobal) {
    notification.userId = "eyJhbGciOi"
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(
      `${isGlobal ? "Global" : "User"} notification sent: ${text} (UUID: ${uuid})`
    )
    return data
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}

// Send notifications with delays between them
async function sendNotificationsWithDelay() {
  console.log("Starting to send test notifications...")

  // Send user-specific notifications
  for (let i = 0; i < notificationTexts.length; i++) {
    const text = notificationTexts[i]
    const delay = i * 2000 // 2 seconds between notifications
    await sendNotification(text, false, delay)
  }

  // Send global notifications
  for (let i = 0; i < globalNotificationTexts.length; i++) {
    const text = globalNotificationTexts[i]
    const delay = i * 2000 // 2 seconds between notifications
    await sendNotification(text, true, delay)
  }

  console.log("All test notifications sent!")
  console.log("Sent notification UUIDs:", Array.from(sentNotificationUUIDs))
}

// Run the test
sendNotificationsWithDelay()
