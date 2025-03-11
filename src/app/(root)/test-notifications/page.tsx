"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Generate a random UUID on the client side
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function TestNotificationsPage() {
  const [notificationText, setNotificationText] = useState("Test notification")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const notification = {
        uuid: generateUUID(),
        timestamp: Date.now(),
        read: false,
        text: notificationText,
        task: {
          identifier: `test-${generateUUID().substring(0, 8)}`,
          file_name: `test-file-${Math.floor(Math.random() * 1000)}.mp3`,
        },
      }

      const response = await fetch("/api/notifications/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      })

      const data = await response.json()
      setResult({ success: response.ok, data })
      console.log("Notification sent:", data)
    } catch (error) {
      console.error("Error sending notification:", error)
      setResult({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='container py-10'>
      <h1 className='text-3xl font-bold mb-6'>Test Notifications</h1>

      <div className='mb-6 flex justify-center gap-4'>
        <Button variant='outline' asChild>
          <a
            href='/api/notifications/debug'
            target='_blank'
            rel='noopener noreferrer'
          >
            Debug Redis
          </a>
        </Button>
        <Button variant='outline' asChild>
          <a
            href='/api/notifications'
            target='_blank'
            rel='noopener noreferrer'
          >
            View Notifications
          </a>
        </Button>
      </div>

      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>Send Test Notification</CardTitle>
          <CardDescription>
            Use this form to send a test notification and verify the
            notification system is working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='notification-text'>Notification Text</Label>
              <Input
                id='notification-text'
                value={notificationText}
                onChange={e => setNotificationText(e.target.value)}
                placeholder='Enter notification text'
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => setNotificationText("Test notification")}
          >
            Reset
          </Button>
          <Button onClick={sendNotification} disabled={loading}>
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <div className='mt-8 max-w-md mx-auto'>
          <h2 className='text-xl font-semibold mb-2'>Result</h2>
          <pre className='bg-muted p-4 rounded-md overflow-auto'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
