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

// Function to send a notification
async function sendNotification(text, delay = 0) {
  // Wait for the specified delay
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const notification = {
    uuid: uuidv4(),
    timestamp: Date.now(),
    read: false,
    text,
    task: {
      identifier: `task-${uuidv4().substring(0, 8)}`,
      file_name: `recording-${Math.floor(Math.random() * 1000)}.mp3`,
    },
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
    console.log(`Notification sent: ${text}`)
    return data
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}

// Send notifications with delays between them
async function sendNotificationsWithDelay() {
  console.log("Starting to send test notifications...")

  for (let i = 0; i < notificationTexts.length; i++) {
    const text = notificationTexts[i]
    const delay = i * 2000 // 2 seconds between notifications
    await sendNotification(text, delay)
  }

  console.log("All test notifications sent!")
}

// Run the test
sendNotificationsWithDelay()
