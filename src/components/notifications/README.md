# Notification System

This directory contains the components for the notification system in the AuditorIA platform.

## Components

### NotificationButton

The `NotificationButton` component displays a bell icon in the navigation bar with a red dot indicator when there are unread notifications. When clicked, it opens a dropdown menu showing all notifications.

Features:

- Displays a red pulsing dot when there are unread notifications
- Shows a dropdown with all notifications when clicked
- Marks all notifications as read when the dropdown is opened
- Allows deleting individual notifications or all notifications
- Navigates to the related content when a notification is clicked

### NotificationToast

The `NotificationToast` hook provides functionality to display toast notifications when new notifications are received. It uses the toast system from `@/components/ui/use-toast`.

Features:

- Displays a toast notification with the notification text
- Provides an action button to navigate to the related content
- Handles errors gracefully with fallback to simpler toast

## Implementation Details

The notification system is implemented using:

1. **React Query** for data fetching and state management
2. **Redis** for storage and pub/sub
3. **Server-Sent Events (SSE)** for real-time updates

### Data Flow

1. Notifications are created via the API endpoints:

   - `/api/notifications` - Regular endpoint
   - `/api/notifications/webhook` - Webhook for external systems

2. Notifications are stored in Redis and published to a Redis channel

3. The frontend subscribes to notifications via SSE at `/api/notifications/events`

4. When a notification is received:

   - It's added to the React Query cache
   - A toast notification is displayed
   - The notification bell shows a red dot indicator

5. When the notification dropdown is opened:
   - All notifications are marked as read
   - The red dot indicator disappears

### Performance Optimizations

The notification system includes several optimizations to prevent blocking the main thread:

1. **Asynchronous Processing**: Notifications are processed asynchronously on the server
2. **Batched Updates**: Notifications are processed in batches on the client
3. **Debounced Rendering**: UI updates are debounced to prevent excessive re-renders
4. **Deduplication**: Duplicate notifications are filtered out

## Related Files

- `src/lib/hooks/use-notifications.ts` - React Query hooks for notifications
- `src/app/api/notifications/` - API endpoints for notifications
- `docs/notifications-webhook.md` - Documentation for the webhook API

## Usage

To use the notification system in a component:

```tsx
import { NotificationButton } from "@/components/notifications/notification-button"

export function MyComponent() {
  return (
    <div>
      <NotificationButton />
    </div>
  )
}
```

To programmatically send a notification:

```tsx
import { useNotifications } from "@/lib/hooks/use-notifications"

export function MyComponent() {
  const { sendNotification } = useNotifications()

  const handleClick = () => {
    sendNotification({
      text: "Your task is complete",
      task: {
        identifier: "task-123",
        file_name: "recording.mp3",
      },
    })
  }

  return <button onClick={handleClick}>Send Notification</button>
}
```
