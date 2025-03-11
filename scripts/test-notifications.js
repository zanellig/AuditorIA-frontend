// Test script to send multiple notifications
const fetch = require("node-fetch")
const { v4: uuidv4 } = require("uuid")

const BASE_URL = "http://localhost:3000"
const WEBHOOK_URL = `${BASE_URL}/api/notifications/webhook`
const ADMIN_API_URL = `${BASE_URL}/api/notifications/admin`
const ADMIN_API_KEY =
  process.env.ADMIN_API_KEY || "admin-api-key-secure-random-string"

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
    const response = await fetch(WEBHOOK_URL, {
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

// Function to delete all global notifications (admin only)
async function deleteAllGlobalNotifications() {
  try {
    console.log("Attempting to delete all global notifications as admin...")

    const response = await fetch(ADMIN_API_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to delete global notifications: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("Successfully deleted all global notifications:", data)
    return data
  } catch (error) {
    console.error("Error deleting global notifications:", error)
    return null
  }
}

// Function to get all global notifications (admin only)
async function getAllGlobalNotifications() {
  try {
    console.log("Attempting to get all global notifications as admin...")

    const response = await fetch(ADMIN_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to get global notifications: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log(`Retrieved ${data.notifications.length} global notifications`)
    return data
  } catch (error) {
    console.error("Error getting global notifications:", error)
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

// Test admin API functions
async function testAdminFunctions() {
  // First, get all global notifications
  await getAllGlobalNotifications()

  // Then, delete all global notifications
  await deleteAllGlobalNotifications()

  // Finally, verify they were deleted
  await getAllGlobalNotifications()
}

// Run the tests
async function runTests() {
  const args = process.argv.slice(2)

  if (args.includes("--send") || args.length === 0) {
    await sendNotificationsWithDelay()
  }

  if (args.includes("--admin") || args.length === 0) {
    await testAdminFunctions()
  }
}

runTests()
