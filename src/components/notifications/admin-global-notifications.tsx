"use client"

import { useState } from "react"
import { useNotifications } from "@/lib/hooks/use-notifications"
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
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdminGlobalNotifications() {
  const { toast } = useToast()
  const { deleteAllGlobalNotifications } = useNotifications()
  const [apiKey, setApiKey] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleDeleteAllGlobalNotifications = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Admin API key is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      await deleteAllGlobalNotifications(apiKey)

      toast({
        title: "Success",
        description: "All global notifications have been deleted",
        variant: "default",
      })

      // Clear the API key after successful deletion
      setApiKey("")
    } catch (error) {
      console.error("Error deleting global notifications:", error)
      toast({
        title: "Error",
        description:
          "Failed to delete global notifications. Check your API key and try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Admin: Global Notifications</CardTitle>
        <CardDescription>
          Delete all global notifications from the system. This action cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This will permanently delete all global notifications for all users.
            This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='api-key' className='text-sm font-medium'>
              Admin API Key
            </label>
            <div className='flex'>
              <Input
                id='api-key'
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder='Enter admin API key'
                className='flex-1'
              />
              <Button
                type='button'
                variant='outline'
                className='ml-2'
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant='destructive'
          onClick={handleDeleteAllGlobalNotifications}
          disabled={isDeleting || !apiKey}
          className='w-full'
        >
          {isDeleting ? (
            <>
              <span className='animate-spin mr-2'>⟳</span>
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete All Global Notifications
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
